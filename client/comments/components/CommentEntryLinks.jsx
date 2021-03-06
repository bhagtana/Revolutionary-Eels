import React from 'react';
import {render} from 'react-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as commentActions from '../actions/commentActions.jsx';
import * as editorActions from '../../src/actions/editorActions.jsx';

class CommentEntryLinks extends React.Component {

  constructor(props) {
    super(props);

    this.getComments = this.getComments.bind(this);
  }

  postEntry () {
    var comment = {
      text: this.props.commentInput,
      block: 1,
      user: this.props.curUser,
      location: this.props.selectionLoc,
      document: this.props.curDoc
    }

    $.ajax({
      method: 'POST',
      url: '/comments',
      data: comment,
      success: (data) => {
        this.props.setSelectionLoc(null);
        this.getComments();
      },
      error: (err) => {
        console.log('error posting entry:', err);
      }
    })
  }

  cancelEntry () {
    this.props.handleCommentInput('');
    this.props.activeCommentStatus(false);
    this.props.updateCommentHeight(50);
    this.props.setSelectionLoc(null);

  }

  getComments () {
    $.ajax({
      method: 'GET',
      url: '/comments',
      dataType: 'json',
      data: {docId: this.props.curDoc},
      success: (data) => {
        this.props.getCommentsSuccess(data);
      },
      error: (err) => {
        console.log('error getting comments:', err);
      }
    })
  }

  render() {
    return (
      <div className="entry-links-container">
        <a className="entry-link-post" onClick={() => this.postEntry()}>post</a>
        <a className="entry-link-cancel" onClick={() => this.cancelEntry()}>cancel</a>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectionLoc: state.comment.selectionLoc,
    commentInput: state.comment.commentInput,
    curUser: state.comment.curUser,
    curDoc: state.comment.curDoc
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    postEntry: commentActions.postEntry,
    cancelEntry: commentActions.cancelEntry,
    setSelectionLoc: editorActions.setSelectionLoc,
    handleCommentInput: commentActions.handleCommentInput,
    activeCommentStatus: commentActions.activeCommentStatus,
    updateCommentHeight: commentActions.updateCommentHeight,
    getCommentsSuccess: commentActions.getCommentsSuccess
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentEntryLinks);
