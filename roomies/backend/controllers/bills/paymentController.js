const mongoose = require("mongoose");

/* Models */
const Payment = require("../../models/Payment");
const Bill = require("../../models/Bill");
const UserComment = require("../../models/UserComment");

/* Controllers */
const billController = require("./billController");
const houseController = require("../houses/houseController");
const notificationController = require("../notificationController");

/**
 * @route       api/bills/payment/:billId/:userId
 * @access      Public
 * @desc        add new payment to billId
 */
exports.addNewPayment = async (req, res) => {
  try {
    // check user approved in house
    if (
      houseController.checkUserCanEdit(req.body.house_ref, req.params.userId)
    ) {
      // create comment if not empty
      const newComment = req.body.comment
        ? await new UserComment({
            author: req.params.userId,
            msg: req.body.comment,
          }).save()
        : undefined;

      //create payment
      const newPayment = await new Payment({
        ...req.body,
        payment_type: "Bill",
        user_comment: newComment,
      }).save();

      // TODO: update payment images

      // add payment to bill
      await Bill.findByIdAndUpdate(req.params.billId, {
        $push: { payments: newPayment },
      });

      try {
        // check if entire bill was paid and create 'bill paid' notification
        const fullBill = await Bill.findById(req.params.billId).populate({
          path: "payments",
          // populate: [{ path: "from_user", select: "name" }],
        });

        if (Number(fullBill.paid) >= Number(fullBill.total_amount)) {
          console.log("creating notification");
          //create notification for paid bill
          await notificationController.createNtfNotificationBill(
            req.body.house_ref,
            fullBill._id
          );
        }
      } catch (err) {
        console.log(err);
      }

      //return all house bills for response
      const newReq = { ...req, params: { houseId: req.body.house_ref } };
      billController.getAllBillsForHouse(newReq, res);
    } else {
      res.status(403).json({ error: "User not authorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Could not add payment" });
  }
};

/**
 * @route       api/bills/payment/:billId/:userId
 * @access      Public
 * @desc        billId holds paymentId
 */
exports.deletePayment = async (req, res) => {
  try {
    // check user made payments
    const payment = await Payment.findById(req.params.billId);

    if (payment.from_user == req.params.userId) {
      // remove payment related comments
      await UserComment.findByIdAndDelete(payment.user_comment);

      // TODO: remove payment related images and documents

      // delete payment from bill
      const bill = await Bill.findOneAndUpdate(
        { payments: payment._id },
        {
          $pull: { payments: [payment._id] },
        }
      );

      // delete payment from db
      await Payment.findByIdAndDelete(payment._id);

      // check if entire bill was paid and create 'bill paid' notification
      const fullBill = await Bill.findById(bill._id).populate({
        path: "payments",
      });

      console.log("got full bill: \n");
      console.log(fullBill);

      // check if bill not fully paid anymode and remove notification for bill paid
      if (Number(fullBill.paid) < Number(fullBill.total_amount)) {
        await Notification.deleteMany({
          type: "NTF",
          ntf_bill: fullBill._id,
        });
      }

      // return all bills
      const newReq = { ...req, params: { houseId: fullBill.ref_house } };
      billController.getAllBillsForHouse(newReq, res);
    } else {
      res.status(403).json({ error: "User not authorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Could not remove payment" });
  }
};

/**
 * @access      Private
 * @desc        gets total payment for house tenants exluding roomie transactions
 */
exports.getPaymentsSum = async (houseId, userId) => {
  try {
    // get bill sums
    const billSums = await this.getBillSumsByTenant(houseId);
    const roomieReceived = await this.getRoomieTransToUser(houseId, userId);
    const roomieTransfered = await this.getRoomieTransFromUser(houseId, userId);

    const totals = {
      billSums: billSums,
      roomieReceived: roomieReceived,
      roomieTransfered: roomieTransfered,
    };

    return totals;
  } catch (err) {
    console.log(err);
    return err;
  }
};

/**
 * @access      Private
 * @returns     transuction Ids : String Array
 * @desc        get roomie transactions user received
 */
exports.getRoomieTransToUser = async (houseId, userId) => {
  try {
    const rTrns = await Payment.aggregate([
      {
        $match: {
          $and: [
            { house_ref: mongoose.Types.ObjectId(houseId) },
            { payment_type: "rTRNS" },
            { to_user: mongoose.Types.ObjectId(userId) },
            // { accepted: true }
          ],
        },
      },
      {
        $group: {
          _id: "$from_user",
          count: { $sum: 1 },
          totalTransfered: { $sum: "$total_amount" },
        },
      },
    ]);

    // console.log("got transfers to user: ");
    // console.log(rTrns);

    return rTrns;
  } catch (err) {
    console.log(err);
    return err;
  }
};

/**
 * @access      Private
 * @returns     transuction Ids : String Array
 * @desc        get roomie transactions user made
 */
exports.getRoomieTransFromUser = async (houseId, userId) => {
  try {
    const rTrnsF = await Payment.aggregate([
      {
        $match: {
          $and: [
            { house_ref: mongoose.Types.ObjectId(houseId) },
            { payment_type: "rTRNS" },
            { from_user: mongoose.Types.ObjectId(userId) },
            // { accepted: true }
          ],
        },
      },
      {
        $group: {
          _id: "$to_user",
          count: { $sum: 1 },
          totalTransfered: { $sum: "$total_amount" },
        },
      },
    ]);

    // console.log("got transfers from user: ");
    // console.log(rTrnsF);

    return rTrnsF;
  } catch (err) {
    console.log(err);
    return err;
  }
};

/**
 * @access      Private
 * @desc        get user's bill transactions (all payments except roomie transuctions)
 */
exports.getBillSumsByTenant = async (houseId) => {
  try {
    const trans = await Payment.aggregate([
      {
        $match: {
          $and: [
            {
              house_ref: mongoose.Types.ObjectId(houseId),
            },
            { payment_type: { $ne: "rTRNS" } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$from_user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { name: 1 } },
          ],
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      { $project: { _id: "$user._id", user: "$user.name" } },
      {
        $group: {
          _id: "$_id",
          // _id: "$$userId",
          user: { $first: "$user" },
          count: { $sum: 1 },
          total: { $sum: "$total_amount" },
        },
      },
    ]);

    console.log("\ntemp bills sums:");
    console.log(trans);

    return trans;
  } catch (err) {
    console.log(err);
    return err;
  }
};

/**
 * @access      Private
 * @desc        get all user's roomie transactions to/from roomies
 */
exports.getRoomieTransForTenant = async (houseId, userId) => {
  try {
    return await Payment.find({
      house_ref: houseId,
      payment_type: "rTRNS",
      $or: [{ to_user: userId }, { from_user: userId }, { accepted: true }],
    }).select("to_user from_user total_amount");
  } catch (err) {
    console.log(err);
    return err;
  }
};
