import React, { useReducer, useEffect, memo, useContext } from "react";
import "../../GenericComponents/general.scss";
import { Link } from "react-router-dom";
import HomeFragment from "./HomeFragment";
import HomeChoreItem from "../../Chores/HomeChoreItem";
import choresReducer from "../../../reducers/chores.reducer.js";
import { ChoresContext } from "../../Chores/ChoresContext";

const USER_SERVICE_URL = "https://jsonplaceholder.typicode.com/users";
const defaultData = {
  isLoading: true,
  isError: false,
  chores: [
    {
      _id: 1,
      leader: "Tenant 1",
      task: "Do dishes",
      dueDate: new Date(2020, 4, 30),
      complete: false
    },
    {
      _id: 2,
      leader: "Tenant 1",
      task: "Get toilet paper",
      dueDate: new Date(2020, 4, 16),
      complete: true
    },
    {
      _id: 3,
      leader: "Tenant 1",
      task: "Save the world",
      dueDate: new Date(2020, 4, 1),
      complete: false
    },
    {
      _id: 4,
      leader: "Tenant 1",
      task: "Sweep floor",
      dueDate: new Date(2020, 3, 25),
      complete: false
    }
  ]
};

// TODO: get USER'S last 5 chores by due date

function HomeChores() {
  const { choresState, choresDispatch } = useContext(ChoresContext);

  // TODO: create useChoresState

  // const [{ chores, isLoading, isError }, choresDispatch] = useReducer(
  //   choresReducer,
  //   defaultData
  // );

  // const [state, choresDispatch] = useReducer(choresReducer, defaultData);

  // useEffect(() => {
  //   console.log("calling get all chores from home");
  //   console.log(choresState.chores);
  //   choresDispatch({ type: "ALL" });
  //   console.log(choresState.chores);
  // }, []);

  const choreItems = choresState.chores.map(chore => (
    <div key={`holder${chore._id}`}>
      <HomeChoreItem
        item={chore}
        // toggleChore={() =>
        //   choresDispatch({
        //     type: "TOGGLE",
        //     id: chore._id,
        //     complete: !chore.complete
        //   })
        // }
      />
    </div>
  ));

  return (
    <div className="card">
      <HomeFragment
        isLoading={choresState.isLoading}
        isError={choresState.isError}
        noData={
          choresState.chores == "undefined" || choresState.chores.length < 1
        }
        title={"Your Chores"}
        itemsName={"chores"}
      >
        <div className="listContainer">
          {/* <div className="titleContainer">Your Chores</div> */}
          {choreItems}
        </div>
      </HomeFragment>

      <Link className="secondary-link underline nav-link" to="/Chores">
        All chores >>
      </Link>
    </div>
  );
}

export default memo(HomeChores);