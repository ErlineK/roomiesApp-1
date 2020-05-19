import { useContext, useEffect } from "react";
import useGetData from "../../../hooks/useGetData";
import { AuthContext } from "../../auth/utils/AuthContext";
import useToggle from "../../../hooks/useToggle";

export default () => {
  const { userId, getUserData } = useContext(AuthContext);
  const [{ data, isLoading, isError }, setRequest] = useGetData({}, {});
  const [acceptingINV, toggleAcceptingINV] = useToggle(false);

  useEffect(() => {
    const userID = userId();
    if (userID && userID !== "" && userID !== undefined) {
      setRequest({
        url: `notifications/${userID}`,
        reqType: "get",
        reqData: {},
      });
    }
  }, [userId(), setRequest]);

  useEffect(() => {
    /* if got notifications data after accepting invitation -> 
        get updated user data and and toggle accepting invitation state */
    if (acceptingINV) {
      getUserData();
      toggleAcceptingINV();
    }
  }, [data, acceptingINV, getUserData, toggleAcceptingINV]);

  const acceptINV = async (ntfId) => {
    toggleAcceptingINV();
    setRequest({
      url: `notifications/${userId()}/${ntfId}`,
      reqType: "patch",
      reqData: { accepted: true, viewed: true },
    });
  };

  const declineINV = async (ntfId) => {
    toggleAcceptingINV();
    setRequest({
      url: `notifications/${userId()}/${ntfId}`,
      reqType: "patch",
      reqData: { accepted: false, viewed: true },
    });
  };

  const ntfActions = {
    acceptINV: acceptINV,
    declineINV: declineINV,
  };

  // const requestStatus = [isLoading, isError];
  const ntfReqStatus = { isLoading: isLoading, isError: isError };

  return [
    {
      notifications: data && data.messages ? data.messages : data,
      ntfActions,
      ntfReqStatus,
    },
  ];
};