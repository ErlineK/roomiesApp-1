import React from "react";
import { GiPayMoney } from "react-icons/gi";
import "../Home/UserHome/homeLists.scss";
import {
  formatDateOnly,
  formatDayMonth,
  formatCurrency
} from "../../utils/formatHelper";
import { getBackgroundByDue } from "../Home/UserHome/homeHelper";

// TODO: set Icon by bill type
// TODO: on bill click go to bill page

function HomeBillItem({ item }) {
  const billingPreiod =
    item && item.start_date && item.end_date
      ? `${formatDayMonth(item.start_date)} - ${formatDayMonth(
          item.start_date
        )}`
      : "";

  return (
    <div
      className={`${getBackgroundByDue(item.dueDate)} listItemHolder`}
      onClick={() => {
        console.log("clicked on bill");
      }}
    >
      <div className="listFlexHolder">
        <GiPayMoney
          className={`${item.total === item.payed ? "success" : ""} listIcon`}
        />

        <div
          className="msgRow lhShort listGridHolder"
          style={{ width: "100%" }}
        >
          {/* <div className="gridItem">
            <p>{item.refNum}</p>
          </div> */}
          <div className="gridItem">
            <p>{billingPreiod}</p>
          </div>

          <div className="gridItem">
            <p>{item.type}</p>
          </div>

          <div className="gridItem">
            <p
              className={`${
                Math.abs(item.payed) >= Math.abs(item.total) ? "success" : ""
              }`}
            >
              {item.payed && item.payed !== item.total
                ? `${formatCurrency(item.total - item.payed)}/`
                : ""}
              {formatCurrency(item.total)}
            </p>
          </div>
          <div className="gridItem">
            <p className="description textLight">
              {formatDateOnly(item.dueDate)}
            </p>
          </div>
        </div>
      </div>

      <hr></hr>
    </div>
  );
}

export default HomeBillItem;
