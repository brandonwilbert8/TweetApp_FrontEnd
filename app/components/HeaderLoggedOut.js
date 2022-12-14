import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post("/api/v1.0/tweets/login", { username, password });
      if (response.data) {
        console.log("Authentication: " + response.data.status);
        console.log(response.data.message);
        if (response.data.status === true) {
          localStorage.setItem("tweetappUsername", username);
          localStorage.setItem("tweetappPassword", password);
          appDispatch({ type: "login" });
          appDispatch({ type: "flashMessage", value: "Welcome to TweetApp!" });
          navigate(`/profile/${username}`);
        } else {
          appDispatch({ type: "logout" });
          appDispatch({ type: "failedFlashMessage", value: "Wrong credentials, please check again." });
          navigate(`/`);
        }
      } else {
        console.log("Incorrect username / password.");
      }
    } catch (e) {
      console.log("There was a problem!");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={(e) => setUsername(e.target.value)} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={(e) => setPassword(e.target.value)} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
        <Link to={`/forgotpassword`} className="">
          <button className="btn btn-danger btn-sm">Forgot Password</button>
        </Link>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
