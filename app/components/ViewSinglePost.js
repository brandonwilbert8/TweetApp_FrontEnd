import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost() {
  const { username, tweetId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const navigate = useNavigate();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`http://localhost:8081/api/v1.0/tweets/${username}/${tweetId}`, { cancelToken: ourRequest.token });
        setPost(response.data);
        setIsLoading(false);
        console.log(response.data);
      } catch (e) {
        navigate("*");
        console.log("There was a problem / request was cancelled");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (!isLoading && !post) {
    return <NotFound />;
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  async function deleteHandler() {
    const areYouSure = window.confirm("Do you really want to delete this tweet?");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`http://localhost:8081/api/v1.0/tweets/${username}/delete/${tweetId}`);
        if (response.data) {
          // 1. display a flash message
          appDispatch({ type: "flashMessage", value: "Post was successfully deleted" });
          // 2. redirect back to the profie page
          navigate(`/profile/${localStorage.getItem("tweetappUsername")}`);
        }
      } catch (e) {
        console.log("There was a problem, could not delete.");
      }
    }
  }

  return (
    <Page title={post.tweetId}>
      <div className="d-flex justify-content-between">
        <h2>Tweet ID: {post.tweetId}</h2>
        <span className="pt-2">
          <Link to={`/post/${post.tweetId}/edit`} data-tip="Update Tweet" data-for="edit" className="text-primary mr-2">
            <i className="fas fa-edit"></i>
          </Link>
          <ReactTooltip id="edit" className="custom-tooltip" />{" "}
          <a onClick={deleteHandler} data-tip="Delete Tweet" data-for="delete" className="delete-post-button text-danger">
            <i className="fas fa-trash"></i>
          </a>
          <ReactTooltip id="delete" className="custom-tooltip" />
        </span>
      </div>

      <p className="text-muted small mb-4">
        Posted by <Link to={`/profile/${post.username}/`}>{post.username}</Link>
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.tweet} allowedElements={["p", "br", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li"]} />
      </div>
    </Page>
  );
}

export default ViewSinglePost;
