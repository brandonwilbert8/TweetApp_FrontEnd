import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Page from "./Page";
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";

function CreateTweet(props) {
  const username = localStorage.getItem("tweetappUsername");
  const [tweet, setTweet] = useState();
  const navigate = useNavigate();
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  //let x = Math.floor(Math.random() * 20000 + 1);
  //let x = new Date().getTime();
  var showDate = new Date();
  const postedDate = showDate.getDate() + "/" + showDate.getMonth() + "/" + showDate.getFullYear();
  const postedTime = showDate.getHours() + ":" + showDate.getMinutes();

  const initialState = {
    tweet: {
      value: "",
      hasErrors: false,
      message: "",
      checkCount: 0,
    },
    tweetTag: {
      value: "",
      hasErrors: false,
      message: "",
      checkCount: 0,
    },
    submitCount: 0,
  };

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  function ourReducer(draft, action) {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case "tweetImmediately":
        draft.tweet.hasErrors = false;
        draft.tweet.value = action.value;
        if (draft.tweet.value.length > 144) {
          draft.tweet.hasErrors = true;
          draft.tweet.message = "Tweet cannot be more than 144 characters";
        }
        if (draft.tweet.value.length <= 0) {
          draft.tweet.hasErrors = true;
          draft.tweet.message = "Tweet cannot be empty";
        }
        return;
      case "tweetAfterDelay":
        if (!draft.hasErrors && !action.noRequest) {
          draft.tweet.checkCount++;
        }
        return;
      case "tweetTagImmediately":
        draft.tweetTag.hasErrors = false;
        draft.tweetTag.value = action.value;
        if (draft.tweetTag.value.length > 50) {
          draft.tweetTag.hasErrors = true;
          draft.tweetTag.message = "A tag cannot be more than 50 characters";
        }
        return;
      case "tweetTagAfterDelay":
        if (!draft.hasErrors && !action.noRequest) {
          draft.tweetTag.checkCount++;
        }
        return;
      case "submitForm":
        if (!draft.tweet.hasErrors && !draft.tweetTag.hasErrors) {
          draft.submitCount++;
        }
        return;
    }
  }

  useEffect(() => {
    if (state.tweet.value) {
      const delay = setTimeout(() => dispatch({ type: "tweetAfterDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.tweet.value]);

  useEffect(() => {
    if (state.tweetTag.value) {
      const delay = setTimeout(() => dispatch({ type: "tweetTagAfterDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.tweetTag.value]);

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();

      async function postTweet() {
        try {
          const response = await Axios.post(
            `/api/v1.0/tweets/${username}/add`,
            {
              //tweetId: x,
              tweet: state.tweet.value,
              username: username,
              tag: state.tweetTag.value,
              postedTweetDate: postedDate,
              postedTweetTime: postedTime,
            },
            { cancelToken: ourRequest.token }
          );
          // Redirect to the new tweet page
          appDispatch({ type: "flashMessage", value: "Congratulations, you have successfully added a new tweet." });
          navigate(`/profile/${username}`);
          console.log("New tweet successfully added");
        } catch (e) {
          console.log("There was a problem, cannot post tweet");
        }
      }
      postTweet();
      return () => ourRequest.cancel();
    }
  }, [state.submitCount]);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "tweetImmediately", value: state.tweet.value });
    dispatch({ type: "tweetTagImmediately", value: state.tweetTag.value });
    dispatch({ type: "submitForm" });
  }

  // async function handleSubmit(e) {
  //   e.preventDefault();
  //   try {
  //     const response = await Axios.post("http://localhost:8081/api/v1.0/tweets/${username}/add", {
  //       tweetId: x,
  //       tweet: tweet,
  //       username: username,
  //     });
  //     // Redirect to the new tweet page
  //     appDispatch({ type: "flashMessage", value: "Congratulations, you have successfully added a new tweet." });
  //     navigate(`/profile/${username}`);
  //     console.log("New tweet successfully added");
  //   } catch (e) {
  //     console.log("There was a problem");
  //   }
  // }

  /*
  <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>
  */

  return (
    <Page title="Create New Tweet">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Tweet:</small>
          </label>
          <textarea onChange={(e) => dispatch({ type: "tweetImmediately", value: e.target.value })} name="tweet" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
          <CSSTransition in={state.tweet.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
            <div className="alert alert-danger small liveValidateMessage">{state.tweet.message}</div>
          </CSSTransition>
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Add a tag:</small>
          </label>
          <textarea onChange={(e) => dispatch({ type: "tweetTagImmediately", value: e.target.value })} name="tweetTag" id="post-body" className="body-content textarea form-control" type="text"></textarea>
          <CSSTransition in={state.tweetTag.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
            <div className="alert alert-danger small liveValidateMessage">{state.tweetTag.message}</div>
          </CSSTransition>
        </div>

        <button className="btn btn-primary" type="submit">
          Post Tweet
        </button>
      </form>
      <div className="text-muted text-right">Tweet Character: {state.tweet.value.length}/144</div>
      <div className="text-muted text-right">Tag Character: {state.tweetTag.value.length}/50</div>
    </Page>
  );
}

export default CreateTweet;
