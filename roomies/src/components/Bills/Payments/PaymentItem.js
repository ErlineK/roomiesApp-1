import React from "react";
import { formatDateOnly, formatCurrency } from "../../../utils/formatHelper";
import "../../GenericComponents/ui/generic_list.scss";
import { getIconByAction } from "../billsHelper";
import "../../GenericComponents/ui/icons.scss";

export default function PaymentItem({ item, action }) {
  const isFinished = action == "complete";

  return (
    <div className="">
      <div className="flex-container flex-between listItemLight">
        <div className="flex-container">
          <div
            className="flex-container flex-between"
            style={{ padding: "0.25rem" }}
          >
            {getIconByAction(action, "ic ic_md ic_decore ic_margins")}
            {!isFinished && (
              <span className="description">
                {formatDateOnly(item.transaction_date)}
              </span>
            )}
          </div>
          {isFinished ? (
            <span className="success">Payment complete!</span>
          ) : (
            <>
              <div>
                <p>
                  <span>
                    &nbsp; &nbsp;
                    {item.from_user.name} payed{" "}
                    {formatCurrency(item.total_amount)}
                  </span>
                </p>
                {item.user_comment && (
                  <p className="description comment">{item.user_comment.msg}</p>
                )}
              </div>
            </>
          )}
        </div>

        {!isFinished && <span>{item.reference_num}</span>}
      </div>

      <hr className="separator-light"></hr>
    </div>
  );
}