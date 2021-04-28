// helper functions
function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
};

function toCamelCase(str) {
  return str.replace(/[^a-z ]/ig, '').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function writeCookie(key, value, days) {
  var date = new Date();
  days = days || 365; // Default at 365 days
  date.setTime(+date + (days * 86400000)); //24 * 60 * 60 * 1000
  window.document.cookie = key + "=" + value + "; expires=" + date.toGMTString() + "; path=/";
  return value;
}
var helpers = function() {
  var getSearchResultsPage = function(pageType, query, section, sortOrder, page, per_page, posttopicID) {
    return $.getJSON('/api/v2/help_center/' + pageType + '/search?query=' + query + '&label_names=' + section + '&sort_order=' + sortOrder + '&sort_by=created_at&page=' + page + '&per_page=' + per_page + '&topic=' + posttopicID + '');
  }
  var getSearchResults = function(section, sortOrder, page, per_page) {
    return $.getJSON('/api/v2/help_center/articles/search?label_names=' + section + '&sort_order=' + sortOrder + '&sort_by=created_at&page=' + page + '&per_page=' + per_page + '');
  }
  var getArticleInformation = function(id) {
    return $.getJSON('/api/v2/help_center/en-gb/sections/' + id + '/articles');
  }
  var updateRequest = function(userName, userEmail, subject, comment) {
    var rg;
    var requestEndpoint = "https://d3v-cliency.zendesk.com/api/v2/requests.json";
    return $.getJSON('/api/v2/users/me.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        rg = r;
      })
      .then(function(q) {
        var request = {
          request: {
            "requester": {
              "name": userName,
              "email": userEmail
            },
            "subject": "A new User Has Registered",
            "comment": {
              "body": "A new User Has Registered"
            }
          }
        }
        return $.ajax({
          url: requestEndpoint,
          type: "POST",
          contentType: 'application/json',
          data: JSON.stringify(request),
          headers: {
            "X-CSRF-Token": rg.user.authenticity_token
          }
        })
      })
  }
  var getPosts = function() {
    return $.getJSON('/api/v2/community/posts', function(data) {
      return data;
    });
  }
  var deleteTopicSubscribeStatus = function(topicID) {
    var subscriptions;
    var csrf;
    var subscriptionsStatus;
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/topics/' + topicID + '/subscriptions',
          type: "GET",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
        return $.getJSON('/api/v2/users/me.json');
      }).then(
        function(user) {
          subscriptionsStatus = $.grep(subscriptions.subscriptions, function(e) {
            return e.user_id == user.user.id;
          })[0];
          return $.ajax({
            url: '/api/v2/community/topics/' + subscriptionsStatus.content_id + '/subscriptions/' + subscriptionsStatus.id,
            type: "DELETE",
            headers: {
              "X-CSRF-Token": csrf.current_session.csrf_token
            }
          })
        }
      ).then(
        function() {
          return subscriptionsStatus;
        }
      );
  }
  var getMultipleUserTopicStatus = function(topicID) {
    var subscriptions;
    var csrf;
    var user;
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
      })
      .then(function() {
        user = $.getJSON('/api/v2/users/me.json');
        return user;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/topics/' + topicID[0] + '/subscriptions',
          type: "GET",
          headers: {
            "X-CSRF-Token": csrf.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
      })
      .then(function() {
        return $.grep(subscriptions.subscriptions, function(e) {
          return e.user_id == user.responseJSON.user.id;
        })[0];
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/topics/' + topicID[1] + '/subscriptions',
          type: "GET",
          headers: {
            "X-CSRF-Token": csrf.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
      })
      .then(function() {
        return $.grep(subscriptions.subscriptions, function(e) {
          return e.user_id == user.responseJSON.user.id;
        })[0];
      }).then(function(r) {
        return $.ajax({
          url: '/api/v2/community/topics/' + topicID[2] + '/subscriptions',
          type: "GET",
          headers: {
            "X-CSRF-Token": csrf.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
      })
      .then(function() {
        return $.grep(subscriptions.subscriptions, function(e) {
          return e.user_id == user.responseJSON.user.id;
        })[0];
      });
  }
  var getUserTopicStatus = function(topicID) {
    var subscriptions;
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/topics/' + topicID + '/subscriptions',
          type: "GET",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
        return $.getJSON('/api/v2/users/me.json');
      })
      .then(function(user) {
        return $.grep(subscriptions.subscriptions, function(e) {
          return e.user_id == user.user.id;
        })[0];
      });
  }
  var deletePost = function(postID) {
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/+ postID +',
          type: "DELETE",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      });
  }
  var deleteComment = function(postID, commentID) {
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/' + postID + '/comments/' + commentID,
          type: "DELETE",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      });
  }
  var deletePost = function(postID) {
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/' + postID,
          type: "DELETE",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      });
  }
  var getUserPostSubcribeStatus = function(postId) {
    var subscriptions;
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/' + postId + '/subscriptions.json',
          type: "GET",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
        return $.getJSON('/api/v2/users/me.json');
      })
      .then(function(user) {
        return subscriptionsStatus = $.grep(subscriptions.subscriptions, function(e) {
          return e.user_id == user.user.id;
        })[0];
      })
  }
  var subscribeToPost = function(postId) {
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/' + postId + '/subscriptions.json',
          type: "POST",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      });
  }
  var deletePostSubscribeStatus = function(postId) {
    var subscriptions;
    var csrf;
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/' + postId + '/subscriptions.json',
          type: "GET",
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      }).then(function(subscriptionsresult) {
        subscriptions = subscriptionsresult;
        return $.getJSON('/api/v2/users/me.json');
      }).then(
        function(user) {
          var subscriptionsStatus = $.grep(subscriptions.subscriptions, function(e) {
            return e.user_id == user.user.id;
          })[0];
          return $.ajax({
            url: '/api/v2/community/posts/' + subscriptionsStatus.content_id + '/subscriptions/' + subscriptionsStatus.id,
            type: "DELETE",
            headers: {
              "X-CSRF-Token": csrf.current_session.csrf_token
            }
          })
        }
      );
  }
  var addComment = function(postID, comment) {
    var commentData = {
      "comment": {
        "body": comment
      },
      "notify_subscribers": true
    };
    var subscribeChecked = $('#subscribe_checkbox').is(":checked");
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/posts/' + postID + '/comments',
          type: "POST",
          data: commentData,
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      })
      .then(function() {
        if (subscribeChecked === false) {
          return deletePostSubscribeStatus(postID).done(function() {})
        }
      })
  }
  var getUserInformation = function() {
    return $.getJSON('/api/v2/users/me.json').then(function(r) {
      return r;
    });
  }
  var subscribeToTopic = function(topicID, includeComments = false) {
    var subscriptionData = {
      "subscription": {
        "include_comments": includeComments
      }
    };
    return $.getJSON('/hc/api/internal/csrf_token.json').then(function(r) {
        csrf = r;
        return r;
      })
      .then(function(r) {
        return $.ajax({
          url: '/api/v2/community/topics/' + topicID + '/subscriptions',
          type: "POST",
          data: subscriptionData,
          headers: {
            "X-CSRF-Token": r.current_session.csrf_token
          }
        })
      })
  }
  var checkTag = function(type) {
    // Get User Tags.
    tags = HelpCenter.user.tags;
    // Is the user an end user?
    if (HelpCenter.user.role == "end_user") {
      // Do we have a ZD Tag of "esfacommunities"?
      if (jQuery.inArray(type, tags) === -1) {
        // Is the local storage for esfacommunties set?
        if (localStorage.getItem(type) === null) {
          localStorage.setItem(type, 1);
          updateRequest(HelpCenter.user.name, HelpCenter.user.email, "A New User Has Registered ".type, "A new User Has Registered").done(
            function(r) {
              // Request is successful.
              // console.log("Sent OK ",type,r);
            }
          ).fail(
            function(r) {
              // Request is not successful.
              // console.log("Failed", type ,f);
            }
          )
        }
        return true;
      }
    }
    return false;
  }
  return {
    getPosts: function() {
      return getPosts();
    },
    deleteTopicSubscribeStatus: function(topicID) {
      return deleteTopicSubscribeStatus(topicID);
    },
    updateRequest: function(name, subject, comment) {
      return updateRequest(name, subject, comment);
    },
    getUserTopicStatus: function(topicID) {
      return getUserTopicStatus(topicID);
    },
    deleteComment: function(postID, commentID) {
      return deleteComment(postID, commentID);
    },
    deletePost: function(postID) {
      return deletePost(postID);
    },
    getUserPostSubcribeStatus: function(postId) {
      return getUserPostSubcribeStatus(postId);
    },
    getMultipleUserTopicStatus: function(topicID) {
      return getMultipleUserTopicStatus(topicID);
    },
    subscribeToPost: function(postId) {
      return subscribeToPost(postId);
    },
    deletePostSubscribeStatus: function(postId) {
      return deletePostSubscribeStatus(postId);
    },
    addComment: function(postID, comment) {
      return addComment(postID, comment);
    },
    getArticleInformation: function(id) {
      return getArticleInformation(id);
    },
    updateRequest: function(name, subject, comment) {
      return updateRequest(name, subject, comment);
    },
    getUserInformation: function() {
      return getUserInformation();
    },
    subscribeToTopic: function(topicId, includeComments = false) {
      return subscribeToTopic(topicId, includeComments);
    },
    getSearchResults: function(section, sortOrder, page, per_page) {
      return getSearchResults(section, sortOrder, page, per_page);
    },
    getSearchResultsPage: function(pageType, query, section, sortOrder, page, per_page, posttopicID) {
      return getSearchResultsPage(pageType, query, section, sortOrder, page, per_page, posttopicID);
    },
    checkTag: function(type) {
      return checkTag(type);
    }
  }
}();
var users = function() {
  var getUserInformation = function() {
    return $.getJSON('/api/v2/users/me.json').then(function(r) {
      return r;
    });
  }
  return {
    getUserInformation: function() {
      return getUserInformation();
    }
  }
}();
// when document is loaded and safe to use JQuery
document.addEventListener('DOMContentLoaded', function() {
  // global vars
  var $devenvID = "d3v-esfadevenv"; //Use this code to set the ID for the dev form
  var $preprodID = "cxfeconnecttest"; //Use this code for the pre-prod
  var $prodID = "esfahelp"; // Use this code for the prod-environment
  var $mandatory_capture = $('#request_custom_fields_360012702660');
  // add gds classes
  $('html').addClass("govuk-template");
  $('body').addClass("govuk-template__body");
  $('body').addClass('js-enabled');
  // change default text to custom text
  $("#signinbuttonheader a").text('Sign in / Create an account');
  $("#signinbuttonminimenu a").text('Sign in / Create an account');
  $('.subtopic').text('Forum');
  $('.submit-button-postpage').val('Publish post');
  $('.max-characters-64').attr('maxlength', 64);
  $('#community_post_details').attr('maxlength', 1000);
  $('#mobilesubscribebutton a').html('');
  $('.community_post').html(' ');
	// Jquery overwrite
  $('.breadcrumbs > li > a').first().val('Home');
  $('.menupostpagetest a').unwrap();
  $('.menupostpagetest .dropdown-toggle').hide();
  // set back link click event
  $('[data-back-link]').on('click', function(event) {
    event.preventDefault();
    if (document.referrer.indexOf(window.location.hostname) === -1) {
      switch ($(this).attr('data-back-link')) {
        case 'article':
          window.location.href = '/hc/en-gb/categories/' + esfa_general_variables.article_id + '-Articles';
          break;
        case 'topic':
          window.location.href = '/hc/en-gb/community/topics/' + esfa_general_variables.topic_id + '-Training-Providers?sort_by=created_at';
          break;
        default:
          window.location.href = '/hc/en-gb/';
      }
    } else {
      window.history.back();
    }
  });
  // sign in dropdown click event
  $('#signindropdown').click(function() {
    $('#userprofileheaderdesktop.dropdown-menu').toggle();
  });
  // apply sort value to links to community topics page
  $('a[href*="/community/topics/"]').each(function() {
    var href = $(this).attr('href');
    if (href.indexOf('sort_by') < 0) {
      $(this).attr('href', href + (href.indexOf('?') < 0 ? '?' : '&') + 'sort_by=created_at');
    }
  });
  // record current page when linking to feedback form
  $('#feedbackLink').click(function() {
    sessionStorage.setItem('feedbackFromReturn', window.location.pathname + window.location.search);
  });
  // update Zendesk date format to remove time
  if ($('.remove-time-from-date').length) {
    removeTimeFromDate();
  };
  // apply GDS styles if required
  if ($('[data-apply-gds]').length) {
    applyGdsStyles();
  }
  // apply custom tag classes
  if ($('[data-custom-tag]').length) {
    applyCustomTags();
  }
  // replace Zendesk dropdowns with GDS radio buttons
  if ($('input[type=hidden][data-tagger]').length) {
    insertGdsRadios();
  }
  // apply input loss warning if required
  if ($('[data-input-loss-warning]').length) {
    applyInputDataLossWarning();
  }
  // const selectors for the form fields
  const radioLabelMatchScore = $('label:contains("Why did you give this score?")');
  // hide this form on select
  $(radioLabelMatchScore).parent().hide();
  // show text box on click of feedback question one
  $('input:radio[name="feedback-question-1"]').click(function(e) {
    $(radioLabelMatchScore).parent().show();
  });
  // toggle the menu on mobile
  $('#headermenubuttonmobile').click(function(e) {
    // toggle in here
    $('#navigation3').toggle();
  });
  $('.dateformatsearch time:contains("Yesterday")').each(function(i) {
    $(this).html($(this).html().toLowerCase());
  });
  if ($mandatory_capture.val() == 1) {
    $('#surveyfeedbackradiobuttons').addClass('error-message-survey-feedback');
    $('#changed-name-error').removeClass('error-message-selection-message');
    $('#request_custom_fields_360007830938_error').html('');
    $('#changed-name-error').addClass('notification-error');
    $('#surveyfeedbackradiobuttons').addClass('error-message-radiobuttons');
  }
  /* START cookie banner */
  var $cookieBanner = $('#global-cookie-message-help');
  if (!document.cookie.split('; ').find(row => row.startsWith('seen_cookie_message_help'))) {
    $cookieBanner.show();
  }
  $cookieBanner.find('button.gem-c-button').click(function() {
    writeCookie('seen_cookie_message_help', 'cookie_policy', 365);
    writeCookie('AnalyticsConsent', 'true', 365);
    $cookieBanner.find('#cookieWrapper').hide();
    var $cookieConfirm = $cookieBanner.find('.gem-c-cookie-banner__confirmation');
    $cookieConfirm.show().find('.gem-c-cookie-banner__hide-button').click(function() {
      $cookieBanner.hide();
    });
  });
  /* END cookie banner */
  /* START maintain list state on back-button */
  var requestSubject = $('#request_subject');
  if (requestSubject.length) { //if the contact form with subject search articles options
    var mySearchDiv = $('.suggestion-list');
    $(window).on('beforeunload', function() { //when refreshing the page
      $('#tempList').remove();
    });
    if (localStorage.getItem("thisURL") == window.location.href) { //back-button used?
      requestSubject.val(localStorage.getItem("theInputVal"));
      mySearchDiv.html('<div id="tempList">' + localStorage.getItem("theListHTML") + '</div>');
    } else {
      requestSubject.val('');
      requestSubject.attr("autocomplete", "off");
    }
    $('body').on('click', mySearchDiv.find('a'), function() {
      var theList = mySearchDiv.html();
      var theVal = requestSubject.val();
      localStorage.setItem("theListHTML", theList);
      localStorage.setItem("theInputVal", theVal);
    });
    requestSubject.keyup(function() {
      $('#tempList').remove();
    });
    localStorage.setItem("thisURL", window.location.href);
  } else { //all other pages
    $('.submit-a-request').add('.govuk-link').click(function() { //.govuk-link = feedback button
      localStorage.setItem("theInputVal", ""); //not removeItem
      localStorage.setItem("theListHTML", ""); //not removeItem
    });
  }
  /* END maintain list state on back-button */
  /* START New Ticket Request page */
  if (jQuery('#new_request').length) { //we're on a ticket form page
    var ticketForm = getUrlParameter('ticket_form_id');
    var $new_request = $('#new_request');
    var $request_subject = $('#request_subject');
    // parameters for the requests page
    var pagetypeURL = getUrlParameter('pagetype');
    var prevlinkURL = getUrlParameter('prevlink');
    if (ticketForm != undefined) {
      var $request_anonymous_requester_email = $('#request_anonymous_requester_email');
      var $request_description_hint = $('#request_description_hint');
      var $request_description_label = $('#request_description_label');
      var $request_description = $('#request_description');
      var $request_description_label = $('label[for=request_anonymous_requester_email]');
      if (ticketForm == 360001017919) {
        $request_subject.text('');
        enquiriesForm();
      }
      // For Development Environment
      if (window.location.href.indexOf($devenvID) > 1) { //Check for the devID
        //form variables for dev
        var $generalizedenvID = 360000200057; //Assign the service feedback ID for demo
        // For PreProd Environment
      } else if (window.location.href.indexOf($preprodID) > 1) { //Check for the preprodID
        //Form variables for preprod
        var $generalizedenvID = 360000641939; //Assign the form ID
        // For Production Environment
      } else if (window.location.href.indexOf($prodID) > 1) { //Check for the prodID
        //Form variables for prod
        var $generalizedenvID = 360000690799; //Assign the form ID
      }
      if (ticketForm == $generalizedenvID || $request_description.val() == "This is a ticket generated by the ESFA helpcentre and contains the response of a end user that has given their feedback.") {
        var feedbackFormTitle = $('[data-feedback-form-title]').attr('data-feedback-form-title');
        $('#enquiriesFormExtraFields').hide();
        $('label[for="request-attachments"]').parent().hide();
        $('<h1 class="govuk-heading-xl govuk-!-margin-top-8 govuk-!-margin-bottom-8">Service Feedback</h1>').insertBefore(feedbackFormTitle);
        $('#ticket-heading').html('Service feedback').show();
        document.title = 'Submit Feedback'; //Set the title of the back to submit feedback
        var $radiobuttonselection; //A variable to record the user feedback
        $request_description_label.html('Your feedback'); //Set the description label to say 'your feedback'
        $request_anonymous_requester_email.val('example@email.com'); //Set the email address of the requester
        $request_anonymous_requester_email.hide(); //Hide the requester box
        $request_description_hint.hide(); //Hide the request description label
        $request_description_label.val('example question'); //Set the description label to example question
        $request_description.val('This is a ticket generated by the ESFA helpcentre and contains the response of a end user that has given their feedback.'); //Set the description of the ticket so that it is clear where it originated from
        $request_description.hide(); //Hide the descrption
        $new_request.find('label[for=request_anonymous_requester_email]').html(''); //Find and change the value of the email input label
        //Question 1 - test
        var $question1surveyquestion = $("label:contains('Overall how satisfied or dissatisfied are you with the Help Centre?')");
        $('#question-1-response-survey').insertAfter($question1surveyquestion);
        $question1surveyquestion.parent().addClass('feedback-question-1');
        $('.feedback-question-1 > [type="text"]').hide();
        $question1surveyquestion.hide();
        //Question 2 - test
        var $question2surveyquestion = $("label:contains('It was easy to find the information I need in the Help Centre')");
        $('#question2-surveyfeedback').insertAfter($question2surveyquestion);
        $question2surveyquestion.parent().addClass('question2-textbox');
        $('.question2-textbox > [type="text"]').hide();
        $question2surveyquestion.hide();
        //question 4 - example test
        var $question4surveyquestion = $("label:contains('The information found in the Help Centre is clear and easy to understand')");
        $('#question4-example').insertAfter($question4surveyquestion);
        $question4surveyquestion.parent().addClass('question4-textbox');
        $('.question4-textbox > [type="text"]').hide();
        $question4surveyquestion.hide();
        //question 5 - example test
        var $question5surveyquestion = $("label:contains('The Help Centre provides all the necessary information I need')");
        $('#question-5-test').insertAfter($question5surveyquestion);
        $question5surveyquestion.parent().addClass('question5-textbox');
        $('.question5-textbox > [type="text"]').hide();
        $question5surveyquestion.hide();
        //question 7 - example test
        var $question7surveyquestion = $("label:contains('Question 7 What could we do to improve your experience with the Help Centre?(optional)')");
        $question7surveyquestion.parent().addClass('question7-textbox');
        $('.question7-textbox label').html('What could we do to improve your experience with the Help Centre?');
        $new_request.find('label[for=request_anonymous_requester_email]').hide(); //Hide the email input
        $new_request.find('label[for=request_custom_fields_360009887399]').hide();
        $request_subject.val('' + pagetypeURL + ' ' + 'feedback').parent().hide(); //Set the subject of the Form to 'Feedback' so that this can be found in the queue
        $request_description_label.hide();
        $("label:contains('Ticket Origin')").parent().hide();
        $("label:contains('Feedback Mandatory')").parent().hide();
        $("label:contains('System Check (System)')").parent().hide();

        //Ticket Type Capture - Prod
        $('#request_custom_fields_360012707339').val(prevlinkURL).hide();
        $new_request.find('label[for="request_custom_fields_360012707339"]').hide();
        $('#request_custom_fields_360012702620').val(pagetypeURL).hide();
        $new_request.find('label[for="request_custom_fields_360012702620"]').hide();
        //Add a rule to hide the label for the name field
        $('label[for=request_custom_fields_360006276137]').hide();
        $('#request_custom_fields_360006276137').hide();
        //Field to collect and record the votes
        $('label[for=request_custom_fields_360007830938]').hide();
        $('#request_custom_fields_360007830938').hide();
        $('#request_custom_fields_360011960360').hide();
        $('#request_custom_fields_360011960360').val('1');
        $('label[for=request_custom_fields_360011960360]').hide();
        $('label[for=request_custom_fields_360011928859]').hide();
        //Function to replace occurances of Help Centre to communities
        if (pagetypeURL === "Communities") {
          $("h2, label").each(function() {
            var hcfeedbacktext = $(this).text();
            hcfeedbacktext = hcfeedbacktext.replace(/the help centre/gi, "Communities");
            $(this).text(hcfeedbacktext);
          });
        }
        if (pagetypeURL === "FEFrontDoor") {
          $("h2, label").each(function() {
            var hcfeedbacktext = $(this).text();
            hcfeedbacktext = hcfeedbacktext.replace(/the help centre/gi, "Find a further education service");
            $(this).text(hcfeedbacktext);
          });
        }
        $("input[type='radio']").change(function() {
          var labelValue = $(this).parent().find("label").html();
          $(this).parents().eq(3).find("input[type='text']").val(labelValue)
        });
      }
    }
  }
  /* END New Ticket Request page */
  if ($('#full_width_pg').length) { //if this id is used once in an article all pg layout is changed to full width
    $('#main-content').find('> .govuk-grid-row > .govuk-grid-column-two-thirds').addClass('govuk-grid-column-full').removeClass('govuk-grid-column-two-thirds');
  }
  /* START Cookie Article, with consent */
  var cookieConsent = $('#select-measure-analytics');
  if (cookieConsent.length) {
    cookieConsent.removeAttr('aria-hidden').append('<div class="govuk-form-group"><fieldset class="govuk-fieldset"><legend class="govuk-fieldset__legend govuk-fieldset__legend--m"><h3 class="govuk-fieldset__heading">Do you want us to measure your website use with Google Analytics?</h3></legend><div class="govuk-radios"><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-Yes" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-Yes">Yes</label></div><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-No" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-No">No</label></div></div></fieldset></div>');
    var cookieGoogle = readCookie('AnalyticsConsent');
    if (cookieGoogle == 'false') {
      $('#cookie-consent-No').prop("checked", true);
      $('#cookie-consent-Yes').prop("checked", false);
    } else { //not false (unset or true)
      $('#cookie-consent-Yes').prop("checked", true);
      $('#cookie-consent-No').prop("checked", false);
    }
    $('#cookie-consent-Yes').change(function() {
      console.log("Cookie Yes");
      writeCookie('AnalyticsConsent', 'true', 365);
      writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
    });
    $('#cookie-consent-No').change(function() {
      writeCookie('AnalyticsConsent', 'false', 365); //document.cookie = "AnalyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; //delete cookie
      writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
    });
  }
  /* END Cookie Article, with consent */
});
// functions called from within DOMContentLoaded
function removeTimeFromDate() {
  $('.remove-time-from-date').each(function() {
    $(this).html(moment($(this).attr('datetime')).format('DD MMMM YYYY'));
  });
}

function applyCustomTags() {
  $.each($('[data-custom-tag]'), function() {
    $(this).addClass('govuk-tag--' + toCamelCase($(this).text()));
  });
}

function applyGdsStyles() {
  // apply GDS style classes to unstyled elements
  $('[data-apply-gds] h1').addClass('govuk-heading-xl');
  $('[data-apply-gds] h2').addClass('govuk-heading-l');
  $('[data-apply-gds] h3').addClass('govuk-heading-m');
  $('[data-apply-gds] h4').addClass('govuk-heading-s');
  $('[data-apply-gds] p').addClass('govuk-body');
  $('[data-apply-gds] a').addClass('govuk-link');
  $('[data-apply-gds] ul').addClass('govuk-list govuk-list--bullet');
  $('[data-apply-gds] ol').addClass('govuk-list govuk-list--number');
  $('[data-apply-gds] blockquote').addClass('govuk-inset-text');
  $('[data-apply-gds] button, [data-apply-gds] input[type="submit"]').addClass('govuk-button');
  $('[data-apply-gds] .form-field').addClass('govuk-form-group');
  $('[data-apply-gds] label').addClass('govuk-label');
  $('[data-apply-gds] input[type="text"]').addClass('govuk-input two-thirds-overwrite');
  $('[data-apply-gds] input[type="number"]').addClass('govuk-input');
  $('[data-apply-gds] textarea').addClass('govuk-textarea').attr('rows', '5');
  $('[data-apply-gds] .form-field > p').addClass('govuk-hint').removeClass('govuk-body');
  $('[data-apply-gds] .searchbox > label').addClass('govuk-heading-s');
  $('[data-apply-gds] .searchbox-suggestions > ul > li > a').addClass('govuk-link');
  $('[data-apply-gds] input[type="tel"]').addClass('govuk-input');
  // checkbox styling
  $('[data-apply-gds] .boolean').addClass('govuk-checkboxes__item');
  $('[data-apply-gds] .boolean > p').addClass('govuk-label govuk-checkboxes__label');
  $('[data-apply-gds] input[value="off"]').addClass('govuk-checkboxes__input');
  $('[data-apply-gds] input[type="checkbox"]').addClass('govuk-checkboxes__input');
  // radio button styling
  $('.govuk-radios').parent().addClass('margin-bottom-zero');
  // show styled elements
  $('[data-apply-gds]').show();
}

function insertGdsRadios() {
  // loop ZenDesk drop downs
  $('input[type=hidden][data-tagger]').each(function() {
    var inputId = $(this).attr('id');
    var options = JSON.parse($(this).attr('data-tagger'));
    var $gdsRadioWrapper = $('<div class="govuk-radios govuk-radios--inline ' + inputId + '_replacement" id="' + inputId + '_replacement"></div>');
    var selectParent = $(inputId + '_replacement').parent();
    // build radio options
    for (var index = 0; index < options.length; index++) {
      if (options[index].value) {
        $gdsRadioWrapper.append('<div class="govuk-radios__item">\
          <input class="govuk-radios__input" id="' + inputId + '_radio_' + index + '" name="' + inputId + '_radio" type="radio" value="' + options[index].value + '">\
          <label class="govuk-label govuk-radios__label govuk-!-padding-left-2 govuk-!-padding-right-0" for="' + inputId + '_radio_' + index + '">' + options[index].label + '</label>\
        </div>');
      }
    }
    // synchronise with ZenDesk drop down
    $gdsRadioWrapper.find('input').change(function() {
      $('#' + inputId).val($(this).val());
    });
    // insert gds radios into DOM
    $(this).after($gdsRadioWrapper);
  });
}

function applyInputDataLossWarning() {
  //set submit action
  $('[data-input-loss-warning="true"] input[type="submit"]').click(function() {
    $('[data-input-loss-warning="true"]').attr('data-input-loss-warning', 'false');
  });
  // set before unload function
  window.onbeforeunload = function() {
    var dataLossWarning = false;
    // check inputs for values, ignoring hidden and submit inputs
    $('[data-input-loss-warning="true"] input:not([type="checkbox"]):not([type="hidden"]):not([type="submit"])').each(function() {
      if ($(this).val()) {
        dataLossWarning = true;
      }
    });
    // check tinymce value
    if ($('[data-input-loss-warning="true"] iframe').contents().find('#tinymce').length > 0 && $('[data-input-loss-warning="true"] iframe').contents().find('#tinymce').html().replace(/(<([^>]+)>)/gi, '').length > 0) {
      dataLossWarning = true;
    }
    if (dataLossWarning) {
      return true;
    }
    return void(0);
  }
}

function checkHiddenCheckbox() {
  $('.boolean > input[type="checkbox"]').on('click', function() {
    $('.boolean > input[type="hidden"]').attr('value', 'on');
  });
}

function insertMutiCheckBox() {
  var fid = $('.hc-multiselect-toggle').attr('id');
  fid = "form_id_" + fid;
  var checkBoxes = '<div id="' + fid + '" class="govuk-checkboxes">';
  $('.hc-multiselect-menu li').each(function(i) {
    checkBoxes = checkBoxes + '<div class="govuk-checkboxes__item"><input id="' + $(this).find("input").val() + '" class="govuk-checkboxes__input" type="checkbox" value="' + $(this).find("input").val() + '"><label class="govuk-label govuk-checkboxes__label govuk-!-padding-left-2 " for="' + $(this).find("input").val() + '">' + $(this).text() + '</label></div>'
  });
  checkBoxes = checkBoxes + '</div>';
  $('.hc-multiselect-menu').parents().eq(1).find("label").first().after(checkBoxes);
  $('#' + fid + ' input').on('click', function() {
    var checkBoxValue = $(this).val();
    $('.hc-multiselect-menu [role="menuitemcheckbox"] :input[value="' + checkBoxValue + '"]').parent().trigger("click");
  });
}
$(window).on("load", function() {
  var howToContactID = 360015466659;
  $('input[name= request_custom_fields_' + howToContactID + '_radio').change(function() {
    if ($('input[type=radio][name= request_custom_fields_' + howToContactID + '_radio]:checked').val() == "email_enquiry") {
      $('#user-contact-preference-select').text("Email");
      $('#uk-telephone-select-summary').hide();
    } else {
      $('#user-contact-preference-select').text("Phone");
      $('#uk-telephone-select-summary').show();
    }
  });
  // enquiries form code to show the 'no' option if the user chooses to select no UKPRN
  $('[value="ukprn_no"]').click(function() {
    $('#noukprn').show();
  })
  $('[value="ukprn_yes"]').click(function() {
    $('#noukprn').hide();
  });
  // enquiries form code to hide the telephone select if the user selects email.
  $('[value="email_enquiry"]').click(function() {
    $('#uk-telephone-select-summary').hide();
  });
  if ($('input[type=hidden][data-tagger]').length) {
    insertMutiCheckBox();
    checkHiddenCheckbox();
    // insert the apprenticeships hint
    // capture the value of the topic selected
    $('.request_custom_fields_360014706580 .govuk-checkboxes input').change(function() {
      var arrcheck = $('.request_custom_fields_360014706580 .govuk-checkboxes input:checked').map(function() {
        return $(this).next()[0];
      });
      var checkboxselect = "";
      for (var i = 0; i < arrcheck.length; i++) {
        if (i != (arrcheck.length - 1)) {
          checkboxselect += (arrcheck[i].innerText + ', ');
        } else {
          checkboxselect += arrcheck[i].innerText;
        }
      }
      $('#enq-confirmation-details-enquiry').text(checkboxselect);
    });
    $('#for-apprenticeships').insertAfter('[for="apprenticeships_service"]');
  }
});
/* START article_page.hbs */
function articlePage(articleTitle) {
  // tag ordering
  var $orderedTags = $('[data-tag-reorder]').clone();
  var ordering = {
    "academies": 1,
    "maintained schools": 2,
    "local authorities": 3,
    "further education and training providers": 4
  };
  $orderedTags.sort(function(a, b) {
    return ordering[$(a).attr('data-tag-reorder').toLowerCase()] - ordering[$(b).attr('data-tag-reorder').toLowerCase()];
  })
  $('[data-tag-reorder]', '[data-tag-order-wrapper]').remove();
  $('[data-tag-order-wrapper]').append($orderedTags);
  // comment box
  var maxLength = 500;
  $('#Comment').keyup(function() {
    var length = $(this).val().length;
    var length = maxLength - length;
    $('#chars').text(length);
    if (length < 0) {
      $('#submitButton').attr('disabled', true);
    } else {
      $('#submitButton').removeAttr('disabled');
    }
  });
  $(".article-voted-up").click(function() {
    $('#isPageUseful').text('Thank you for your feedback').addClass('govuk-!-font-weight-bold');
    $('#articlefeedbacklabel').html('Is there anything we could do to further improve this page? (optional)');
  });
  $(".vote-confirm").click(function() {
    $('#isPageUseful').text('Is this page useful?');
  });
  $(".article-voted-down").click(function() {
    $('#isPageUseful').text('Thank you for your feedback').addClass('govuk-!-font-weight-bold');
    $('#articlefeedbacklabel').html('Why is this page not useful? (optional)');
  });
  $('#commentform').hide();
  $('#feedbackbuttonyes button').click(function() {
    $('#commentform').toggle();
    $('#feedbackbuttonyes button').toggle();
  });
  var getCSRFToken = function(callback, comment) {
    $.ajax({
      url: "/api/v2/users/me.json",
      type: 'GET',
      contentType: "application/json",
      dataType: 'json',
      success: function(result) {
        var csrfToken = result.user.authenticity_token;
        callback(csrfToken, comment);
      }
    });
  }
  var updateRequest = function(csrfToken, comment) {
    var request = {
      "requester": {
        "name": "Article Feedback"
      },
      "subject": articleTitle,
      "comment": {
        "body": comment
      }
    }
    $.ajax({
      url: "/api/v2/requests.json",
      type: 'POST',
      data: JSON.stringify({
        request: request
      }),
      contentType: "application/json",
      headers: {
        "X-CSRF-Token": csrfToken
      },
      success: function(data, textStatus, jqXHR) {
        console.log("Sent OK");
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("Not Sent OK");
      }
    });
  }
  $("#formoid").submit(function(e) {
    e.preventDefault();
    var comment = $("#Comment").val();
    getCSRFToken(updateRequest, comment);
    $('#commentform').hide();
    $('#voteQuestion').hide();
    $('#voteResponse').show();
  });
}
/* END article_page.hbs */
/* START category_page.hbs */
function categoryPage() {
  var noResultsFoundHTML = "<div class='govuk-body noresults'><p class='govuk-!-margin-top-0'>No posts were found based on your filter options.</p><p>Improve your results by changing your filter combinations.</p></div>";
  var internalErrorHTML = "<div class='govuk-body noresults'><p class='govuk-!-margin-top-0'>Due to an internal error, we are unable to show community posts at this time.</p><p>Try refreshing the page in a few moments.</p></div>";
  var getTagClass = function(str) {
    return 'govuk-tag--' + str.replace(/[^a-z ]/ig, '').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return '';
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }
  var getData = function(sectionIDCS, sortBy, page, numberPerPage, clicked) {
    $("#sspinner").show();
    $("#sresults").empty();
    // Onpage Load.
    helpers.getSearchResults(sectionIDCS, sortBy, page, numberPerPage).done(function(r, ts, xhr) {
      $('#ShowingArticleCount').text("Showing page " + r.page + " of " + r.page_count);
      $("#sspinner").hide();
      if (!clicked) {
        // On Page Load.
        // On Page load hide the prev button (We always start at page 1 so prevous won't exist).
        $('.pagination-prev').hide();
        // Display next button if the number per page exceeds or is equal to the total count.
        if ((numberPerPage >= r.count)) {
          $('.pagination-next').hide();
        }
        maxPageNumber = r.page_count;
      } else {
        // On Click.
        // Display prevous if we are not on page one else show.
        if (r.page != 1) {
          $('.pagination').show();
          $('.pagination-prev').show();
        } else {
          $('.pagination-prev').hide();
        }
        if (r.page >= r.page_count) {
          $('.pagination-next').hide();
        } else {
          $('.pagination').show();
          $('.pagination-next').show();
        }
      }
      // Label Colours.
      $.each(r.results, function(key, value) {
        var labelNames = "";
        var orderedlabels = value.label_names;
        var ordering = {
          "academies": 1,
          "maintained schools": 2,
          "local authorities": 3,
          "further education and training providers": 4
        };
        orderedlabels.sort(function(a, b) {
          return ordering[a.toLowerCase()] - ordering[b.toLowerCase()];
        })
        $.each(orderedlabels, function(k, v) {
          labelNames += `<strong class="govuk-tag ${getTagClass(v)} govuk-!-margin-right-2 govuk-!-margin-top-2">${v}</strong>`;
        });
        $("#sresults").append(`
  				<div class="border-bottom-1px govuk-!-margin-bottom-2">
            <a href="${value.html_url}" class="govuk-link govuk-!-margin-bottom-1 govuk-!-font-size-19 govuk-!-font-weight-bold">${value.name}</a>
            <p id="${value.id}" class="govuk-body govuk-!-font-size-16 last-updated-black govuk-!-margin-top-1 govuk-!-margin-bottom-2">Last updated ${value.updated_at}</p>
            <div class="govuk-tag-list">
            	<strong id="${value.id}promoted" class="govuk-tag govuk-tag--green govuk-!-margin-right-2 govuk-!-margin-top-2">New</strong>
              ${labelNames}
            </div>
            <p class="govuk-body font-color-override-gds govuk-!-margin-top-2 govuk-!-margin-bottom-2">${value.snippet}&hellip;</p>
  				</div>`);
        if (value.promoted == false) {
          $("#" + value.id + "promoted").hide();
        }
        $('#' + value.id).text('Last updated ' + moment(value.updated_at).format('Do MMMM YYYY'));
      });
      if (r.count == 0) {
        $('#ShowingArticleCount').text("Showing page 0 of 0");
        $("#sresults").empty();
        $("#sresults").append(noResultsFoundHTML);
      }
      if (xhr.status == 429) {
        $('#ShowingArticleCount').text("Showing page 0 of 0");
        $("#sresults").empty();
        $("#sresults").append(internalErrorHTML);
      }
    }).fail(function() {
      $("#sresults").empty();
      $("#sresults").append(internalErrorHTML);
    });
  }
  var newPage = 1;
  var maxPageNumber = 0;
  var numberPerPage = 15;
  // Get the selected checkbox ID's.
  var selected = [];
  $('.govuk-checkboxes__item input:checked').each(function() {
    selected.push($(this).attr('value'));
  });
  // Convert to comma separated array.
  var sectionIDCS = selected.join(",");
  getData(sectionIDCS, "desc", 1, numberPerPage, false);
  $('.govuk-checkboxes__input,.next,.prev').click(function(e) {
    // Decrement for Previous Page.
    if ($(this).hasClass('prev')) {
      $(window).scrollTop(0);
      e.preventDefault();
      newPage--;
    }
    // Increment for Next Page.
    if ($(this).hasClass('next')) {
      $(window).scrollTop(0);
      e.preventDefault();
      newPage++;
    }
    // Clamp pagination lower limit.
    if (newPage < 1) {
      newPage = 1;
    }
    // Clamp pagination max limit.
    if (newPage > maxPageNumber) {
      newPage = maxPageNumber;
    }
    // Go to the first page if the checkbox is selected.
    if ($(this).hasClass('govuk-checkboxes__input')) {
      newPage = 1;
    }
    // Get the selected checkbox ID's.
    var selected = [];
    $('.govuk-checkboxes__item input:checked').each(function() {
      selected.push($(this).attr('value'));
    });
    // Convert to comma separated array.
    var sectionIDCS = selected.join(",");
    if (sectionIDCS.length != 0) {
      getData(sectionIDCS, "desc", newPage, numberPerPage, true);
    } else {
      $('#ShowingArticleCount').text("Showing page 0 of 0");
      $("#sresults").empty();
      $("#sresults").append(noResultsFoundHTML);
      $('.pagination').hide();
      $('.pagination-prev').hide();
      $('.pagination-next').hide();
    }
  });
}
/* END category_page.hbs */
/* START community_post_page.hbs */
function communityPostPage(postId, topicName) {
  // User registration code start.
  var type = topicName == 'Further education and training providers' ? 'esfacommunities' : 'esfaams';
  if (helpers.checkTag(type)) {
    $('#pendingapproval').show();
    $('.community-sub-topic').hide();
    $('.createnewsignedin').hide();
    $('.subbuttonpost').hide();
    $('.newposbtn').hide();
    $('.repliescommunitypostpage').hide();
    $('.postareply').hide();
  }
  // User registration code end.
  $('#postdelete').click(function(e) {
    e.preventDefault();
    if (confirm("Are you sure?")) {
      helpers.deletePost(postId)
        .done(function(e) {
          document.location.href = "/hc/en-gb/";
        })
        .fail(function(e) {
          $("#subnotification").show();
          $("#subnotification .text").text("We had an issue deleting your post.");
          $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
        })
    }
  });
  $('button#submitcomment').click(function(e) {
    e.preventDefault();
    var value = $("#community_comment_body").val();
    helpers.addComment(postId, value)
      .done(function(e) {
        $("#community_comment_body_ifr").contents().find("body").empty('');
        location.reload(false);
      })
      .fail(function(e) {
        $("#subnotification").show();
        $("#subnotification .text").text("Sorry we had an issue.");
        $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
      })
  });
  $('[data-action="edit-comment"]').each(function(e) {
    $(this).attr('href', '/hc/api/internal/communities/posts/' + postId + '/comments/' + $(this).attr('data-comment-id'));
  });
  $('[data-action="delete-comment"]').click(function(e) {
    e.preventDefault();
    var deleteButton = $(this);
    if (confirm("Are you sure?")) {
      helpers.deleteComment(postId, $(this).attr('data-comment-id'))
        .done(
          function(s) {
            deleteButton.closest(".comment-box").fadeOut("slow", function() {
              $(this).remove();
              if ($('.comment-box--reply').length == 0) {
                $('.comment-no-replies').addClass('comment-no-replies--no-comments');
              }
            });
          }).fail(function(r) {
          $("#subnotification").show();
          $("#subnotification .text").text("We had an issue deleting your comment.");
          $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
        });
    }
    return false;
  });
  $('button#subscribebutton').attr('disabled', true);
  helpers.getUserPostSubcribeStatus(postId)
    .done(
      function(s) {
        $('button#subscribebutton').attr('disabled', false);
        if (typeof subscriptionsStatus !== "undefined") {
          $('button#subscribebutton').text("Unsubscribe from topic");
          $('button#subscribebutton').addClass('govuk-button--warning');
          $('#subscribe_checkbox').prop('checked', true);
        } else {
          $('button#subscribebutton').text("Subscribe to topic");
        }
      })
    .fail(function(r) {
      $("#subnotification").show();
      $("#subnotification .text").text("We had an issue getting your subscription status.");
      $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
      $('button#subscribebutton').attr('disabled', true);
    });
  $('#subscribebutton').click(function(e) {
    if ($('#subscribebutton').text() === "Subscribe to topic") {
      helpers.subscribeToPost(postId)
        .done(function() {
          $('button#subscribebutton').text("Unsubscribe from topic");
          $('button#subscribebutton').addClass('govuk-button--warning');
          $('#subnotification').show();
          $("#subnotification .text").text("You have subscribed to this post.");
          $("#subnotification .text").css('color', '#00703C').css('border-color', '#00703C');
          $('#subscribe_checkbox').prop('checked', true);
        })
        .fail(function() {
          $("#subnotification").show();
          $("#subnotification .text").text("We had an issue subscribing you to this post.");
          $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
          $('button#subscribebutton').attr('disabled', true);
        })
    } else {
      helpers.deletePostSubscribeStatus(postId)
        .done(function(status) {
          $('button#subscribebutton').text("Subscribe to topic");
          $('button#subscribebutton').css('background-color', '#00703C');
          $('#subnotification').show();
          $("#subnotification .text").text("You have unsubscribed from this post.");
          $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
          $('#subscribe_checkbox').prop('checked', false);
        })
        .fail(function(r) {
          $("#subnotification").show();
          $("#subnotification .text").text("We had an issue subscribing you to this post.");
          $("#subnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
          $('button#subscribebutton').attr('disabled', true);
        });
    }
  });
}
/* END community_post_page.hbs */
/* START community_topic_page.hbs */
function communityTopicPage(topicId, topicName) {
  // User registration code start.
  var type = topicName == 'Further education and training providers' ? 'esfacommunities' : 'esfaams';
  if (helpers.checkTag(type)) {
    $('#pendingapproval').show();
    $('.community-sub-topic').hide();
    $('.createnewsignedin').hide();
    $('.subbuttonpost').hide();
    $('.newposbtn').hide();
    $('.repliescommunitypostpage').hide();
    $('.postareply').hide();
  }
  // User registration code end.
  $('button#subtopicbutton').attr('disabled', true);
  var isTopicTrainingProvder = topicName == 'Further education and training providers' ? true : false;
  var buttonDefaultState;
  var buttonPostState;
  var buttonChangeSubState;
  var buttonPostAndReplyState;
  var buttonUnsubPostState;
  var buttonUnsubPostAndReplyState;
  var buttonStateError;
  if (isTopicTrainingProvder) {
    buttonDefaultState = "Subscribe";
    buttonPostState = "You have subscribed to email updates every time someone creates a post.";
    buttonChangeSubState = "Change Subscription";
    buttonPostAndReplyState = "You have subscribed to email updates every time someone creates a post and replies.";
    buttonUnsubPostState = "You have unsubscribed from email updates.";
    buttonUnsubPostAndReplyState = "You have unsubscribed from email updates.";
    buttonStateError = "We had an issue with your subscription.";
  } else {
    buttonDefaultState = "Subscribe to " + topicName.toLowerCase();
    buttonPostState = "You have subscribed to posts from " + topicName.toLowerCase() + ".";
    buttonChangeSubState = "Change Subscription";
    buttonPostAndReplyState = "You have subscribed to posts and replies from " + topicName.toLowerCase() + ".";
    buttonUnsubPostState = "You have unsubscribed from posts from " + topicName.toLowerCase() + ".";
    buttonUnsubPostAndReplyState = "You have unsubscribed from posts and replies from " + topicName.toLowerCase() + ".";
    buttonStateError = "We had an issue with your subscription.";
  }
  helpers.getUserTopicStatus(topicId).done(function(subscriptionsStatus) {
      if (typeof subscriptionsStatus !== "undefined") {
        // We know the user is subscribed add an unsub button.
        $('#unsubfromtopiclist').show();
        if (subscriptionsStatus.include_comments) {
          $('#subwithcomments').css("background-color", "#FFDD00").css("font-weight", "bold");
        } else {
          $('#subwithoutcomments').css("background-color", "#FFDD00").css("font-weight", "bold");
        }
        $('button#subtopicbutton span').text(buttonChangeSubState);
      } else {
        $('#unsubfromtopiclist').hide();
        $('button#subtopicbutton span').text(buttonDefaultState);
      }
      $('button#subtopicbutton').attr('disabled', false);
    })
    .fail(function(r) {
      $("#topicnotification").show();
      $("#topicnotification .text").text("We had an issue with getting your topic subsciption status.");
      $("#topicnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
      $('button#subtopicbutton').attr('disabled', true);
    });
  $('#subwithcomments').click(function(e) {
    e.preventDefault();
    helpers.subscribeToTopic(topicId, true).done(function(r) {
        // Toggle Chevrons.
        $('#chevrondown').toggle();
        $('#chevronup').toggle();
        $('#unsubfromtopiclist').show();
        $('#subspanel').hide();
        $('#subwithcomments').css("background-color", "#FFDD00").css("font-weight", "bold");
        $('#subwithoutcomments').css("background-color", "").css("font-weight", "normal");
        $('button#subtopicbutton span').text(buttonChangeSubState);
        $("#topicnotification").show();
        $("#topicnotification .text").text(buttonPostAndReplyState);
        $("#topicnotification .text").css('color', '#00703C').css('border-color', '#00703C');
        $('button#subtopicbutton').attr('disabled', false);
      })
      .fail(function() {
        $("#topicnotification").show();
        $("#topicnotification .text").text(buttonStateError);
        $("#topicnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
        $('button#subtopicbutton').attr('disabled', true);
      })
  });
  $('#subwithoutcomments').click(function(e) {
    e.preventDefault();
    helpers.subscribeToTopic(topicId).done(function(r) {
        // Toggle Chevrons.
        $('#chevrondown').toggle();
        $('#chevronup').toggle();
        $('#unsubfromtopiclist').show();
        $('#subspanel').hide();
        $('#subwithoutcomments').css("background-color", "#FFDD00").css("font-weight", "bold");
        $('#subwithcomments').css("background-color", "").css("font-weight", "normal");
        $('button#subtopicbutton span').text(buttonChangeSubState);
        $("#topicnotification").show();
        $("#topicnotification .text").text(buttonPostState);
        $("#topicnotification .text").css('color', '#00703C').css('border-color', '#00703C');
        $('button#subtopicbutton').attr('disabled', false);
      })
      .fail(function() {
        $("#topicnotification").show();
        $("#topicnotification .text").text(buttonStateError);
        $("#topicnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
        $('button#subtopicbutton').attr('disabled', true);
      })
  })
  $('#unsubfromtopiclist').click(function(e) {
    helpers.deleteTopicSubscribeStatus(topicId)
      .done(function(status) {
        // Toggle Chevrons.
        $('#chevrondown').toggle();
        $('#chevronup').toggle();
        $('#subwithcomments').css("background-color", "").css("font-weight", "normal");
        $('#subwithoutcomments').css("background-color", "").css("font-weight", "normal");
        $('#unsubfromtopiclist').hide();
        $('#subspanel').hide();
        $('button#subtopicbutton span').text(buttonDefaultState);
        $("#topicnotification").show();
        if (status.include_comments) {
          $("#topicnotification .text").text(buttonUnsubPostAndReplyState);
        } else {
          $("#topicnotification .text").text(buttonUnsubPostState);
        }
        $("#topicnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
        $('button#subtopicbutton').attr('disabled', false);
      })
      .fail(function(r) {
        $("#topicnotification").show();
        $("#topicnotification .text").text(buttonStateError);
        $("#topicnotification .text").css('color', '#D4351C').css('border-color', '#D4351C');
        $('button#subtopicbutton').attr('disabled', true);
      });
  });
  $('#subtopicbutton').click(function(e) {
    $('#subspanel').toggle();
    // Toggle Chevrons.
    $('#chevrondown').toggle();
    $('#chevronup').toggle();
  });
}
/* END community_topic_page.hbs */
/* START search_results.hbs */
function searchResults(query, currentPageType, currentSelectedName) {
  // Global search results properties
  var newPage = 1;
  var maxPageNumber = 0;
  var numberPerPage = 10;
  var pageType = "community_posts";
  // If the user is on a community result or topic page, then pre-select the radio buttons.
  if (currentPageType === "Community") {
    // Ensure the Help Centre results are hidden.
    $("#sresults").hide();
    $('.communitiesRespagination').show();
    $('.CommunityPagination').hide();
    $('#HelpCentreResults').hide();
    // Check which topic the user is viewing.
    switch (currentSelectedName.toLowerCase()) {
      case "academies":
        $('#HCAcademies').prop('checked', true);
        break;
      case "maintained schools":
        $('#HCMaintainedSchools').prop('checked', true);
        break;
      case "local authorities":
        $('#HCLocalAuthorities').prop('checked', true);
        break;
      case "further education and training providers":
        $('#HCFEselect').prop('checked', true);
        break;
      default:
        $('#hcALL').prop('checked', true);
    }
  } else {
    // Articles global variables.
    var pageType = "articles";
    var resultsTextType = '';
    var FEnews = window.location.href.indexOf('fenews=true') > 1;
    if (currentSelectedName === "FE NEWS" || FEnews) {
      var resultsTextType = "News";
      resultsCSS = "esfaNews";
    } else {
      var resultsTextType = "ESFA HELP ARTICLES";
      var resultsCSS = "esfaHelpArticles";
    }
    $('#HelpCentreResults').show();
    $('#CommunityFilterResults').hide();
    $('.communitypagination').hide();
    $("#fenews-select").click(function() {
      resultsTextType = "News";
      $('.resultTypes').addClass('govuk-tag--esfaNews');
      $('.resultTypes').css('background-color', '#626A6E');
      $('#HelpCentreResults').hide();
    });
  }
  var noResultsFoundHTML = "<div class='govuk-!-padding-bottom-4 govuk-!-padding-top-4'><p class='govuk-body'>No results found. Try searching another keyword.</p></div>";
  var internalErrorHTML = "<div class='govuk-!-padding-bottom-4 govuk-!-padding-top-4'><p class='govuk-body'>Due to an internal error, we are unable to show community posts at this time.</p><p class='govuk-body'>Try refreshing the page in a few moments.</p></div>";
  var getData = function(pageType, query, sectionIDCS, sortBy, page, numberPerPage, clicked, posttopicID) {
    $("#sspinner").show();
    $("#sresults").hide();
    $('.CommunityPagination').hide();
    // Onpage Load.
    helpers.getSearchResultsPage(pageType, query, sectionIDCS, sortBy, newPage, numberPerPage, posttopicID).done(function(r, ts, xhr) {
      // Show the results if the 'Articles' option is selected
      $("#sresults").show();
      $('.resultCommunities').hide();
      $('.communitypagination').hide();
      $('.CommunityPagination').show();
      // Clicked means 'does next page exist'
      if (!clicked) {
        // ON PAGE LOAD
        // On Page load hide the prev button (We always start at page 1 so prevous won't exist).
        $('.pagination-prev').hide();
        // Display next button if the number per page exceeds or is equal to the total count.
        if (numberPerPage >= r.count) {
          $('.pagination-next').hide();
        } else {
          $('.pagination-next').show();
        }
        maxPageNumber = r.page_count;
      } else {
        // ON CLICK
        // Display prevous if we are not on page one else show.
        if (r.page != 1) {
          $('.pagination-prev').show();
        } else {
          $('.pagination-prev').hide();
        }
        if (r.page >= r.page_count) {
          $('.pagination-next').hide();
        } else {
          $('.pagination-next').show();
        }
      }
      // Label Colours.
      var labelNames = "";
      $.each(r.results, function(key, value) {
        var labelNames = "";
        var resDetails = value.snippet;
        $.each(value.label_names, function(key, value) {
          labelNames += `<strong class="govuk-tag govuk-tag--small govuk-tag--${toCamelCase(value)} govuk-!-margin-bottom-2 govuk-!-margin-right-2">${value}</strong>`;
        });
        // Show the help centre search results.
        $("#sresults").append(`
                <div class='collapsible-nav-border govuk-!-padding-top-4 articleresultsitems'>
                    <div class='search-results-box'>
                      <div>
                        <h3 class='govuk-heading-s govuk-!-margin-bottom-1 govuk-!-margin-right-1'>
                          <a class='govuk-link' href='${value.html_url}'>${value.name}</a>
                        </h3>
                          <p class='govuk-body govuk-!-margin-bottom-2'>Last updated ${moment(value.updated_at).format('Do MMMM YYYY')}</p>
                      </div>
                      <div>
                        <span class='search-result-votes govuk-!-margin-right-1'> <span aria-hidden='true'> <svg width='19' height='20' viewBox='0 0 19 20' fill='none' xmlns='http://www.w3.org/2000/svg'> <path d='M5.83366 18.3334H3.33366C2.89163 18.3334 2.46771 18.1578 2.15515 17.8452C1.84259 17.5326 1.66699 17.1087 1.66699 16.6667V10.8334C1.66699 10.3913 1.84259 9.9674 2.15515 9.65484C2.46771 9.34228 2.89163 9.16669 3.33366 9.16669H5.83366M11.667 7.50002V4.16669C11.667 3.50365 11.4036 2.86776 10.9348 2.39892C10.4659 1.93008 9.83003 1.66669 9.16699 1.66669L5.83366 9.16669V18.3334H15.2337C15.6356 18.3379 16.0256 18.197 16.3319 17.9367C16.6382 17.6764 16.8401 17.3141 16.9003 16.9167L18.0503 9.41669C18.0866 9.17782 18.0705 8.93392 18.0031 8.7019C17.9357 8.46987 17.8187 8.25527 17.6602 8.07295C17.5017 7.89063 17.3054 7.74496 17.085 7.64603C16.8645 7.54711 16.6252 7.49728 16.3837 7.50002H11.667Z' stroke='#0B0C0C' stroke-width='1.66667' stroke-linecap='round' stroke-linejoin='round'/> </svg> <span class='govuk-body govuk-!-font-size-19 search-result-value'>0</span> </span> </span>
                      </div>
                  </div>
                  <div class="govuk-tag-list">
                  	<span class='resultTypes govuk-tag govuk-tag--small govuk-tag--${resultsCSS} govuk-!-margin-bottom-2 govuk-!-margin-right-2'>${resultsTextType}</span>${labelNames}
                  </div>
                  <article class='govukbodyoverwrite govuk-!-margin-top-1'>
                    <p class='govuk-body search-result-text'>${resDetails}</p>
                  </article>
  `);
      });
      // If no results are found display message.
      if (currentPageType === "Articles" || currentPageType === "All types") {
        if (r.count == 0) {
          $('#ShowingArticleCount').text("Showing page 0 of 0");
          $("#sresults").empty();
          $("#sresults").append(noResultsFoundHTML);
          $('.CommunityPagination').hide();
          $('.communitiesResults').hide();
        }
      }
      if (xhr.status == 429) {
        $('#ShowingArticleCount').text("Showing page 0 of 0");
        $("#sresults").empty();
        $("#sresults").append(internalErrorHTML);
      }
    }).fail(function() {
      $("#sresults").empty();
      $("#sresults").append(internalErrorHTML);
    });
  }
  // Get the selected checkbox ID's.
  var selected = [];
  $('.hcradiolabeloptions input[checked="checked"]').each(function() {
    selected.push($(this).attr('value'));
  });
  // Convert to comma separated array.
  var sectionIDCS = selected.join(",");
  // When a radio button is pressed, load the results for it.
  $("input[type='radio']").on('change', function() {
    $("#sresults").empty();
    // Get the data
    var sectionIDCS = $(this).val();
    var posttopicID = $(this).attr("data-communitytopic");
    // Set the pageType to articles.
    var pageType = "articles";
    // Set the colour of the labels here
    var resultsTextType = '';
    var FEnews = window.location.href.indexOf('fenews=true') > 1;
    if (currentSelectedName === "FE NEWS" || FEnews) {
      var resultsTextType = "News";
      resultsCSS = "esfaNews";
      $('.resultTypes').addClass('govuk-tag--esfaNews');
      $('.resultTypes').css('background-color', '#626A6E');
    } else {
      var resultsTextType = "ESFA HELP ARTICLES";
      var resultsCSS = "esfaHelpArticles";
    }
    if (currentPageType === "Articles" || currentPageType === "All types") {
      // Number per page = put this in the manifest file
      getData(pageType, query, sectionIDCS, "desc", 1, 10, false, posttopicID);
      $('.resultTypes').css('background-color', '#626A6E');
    }
  });
  if (currentPageType === "Articles" && window.location.href.indexOf('fenews=true') > 1) {
    $('#fenews-select').prop('checked', true);
  } else if (currentPageType === "Community") {
    console.log('conditionmet');
    $('#namefilteroptionsCommunity').prop('checked', true);
  } else {
    console.log('condition two met');
    $('#namefilteroptionsArticles').prop('checked', true);
  }
  if (currentPageType === "Community") {
    // Ensure the Help Centre results are hidden.
    $("#sresults").hide();
    $('.communitiesRespagination').show();
    $('.CommunityPagination').hide();
    $('#HelpCentreResults').hide();
    // Check which topic the user is viewing.
    switch (currentSelectedName.toLowerCase()) {
      case "academies":
        $('#HCAcademies').prop('checked', true);
        break;
      case "maintained schools":
        $('#HCMaintainedSchools').prop('checked', true);
        break;
      case "local authorities":
        $('#HCLocalAuthorities').prop('checked', true);
        break;
      case "further education and training providers":
        $('#HCFEselect').prop('checked', true);
        break;
      default:
        $('#hcALL').prop('checked', true);
    }
  }
  $("[name=radioselectsearchpage2]").removeAttr("checked");
  // fe news
  var FEnews = window.location.href.indexOf('fenews=true') > 1;
  var FECategorie = window.location.href.indexOf('category=360003078239') > 1;
  // Perform a check to ensure that the page is not a community results page
  if (currentPageType === "All types" && currentSelectedName != "FE NEWS" && !FEnews || currentPageType === "Articles" && currentSelectedName != "FE NEWS" && !FEnews) {
    var pageType = "articles";
    var posttopicID = "";
    $('.communitypagination').hide();
    $('#sresults').show();
    $('#HelpCentreResults').show();
    getData(pageType, query, sectionIDCS, "desc", 1, 10, false, posttopicID);
  } else if (currentSelectedName === "FE NEWS" || FEnews) {
    $('#HelpCentreResults').hide();
    $("#sresults").hide();
    $('.communitiesRespagination').show();
    $('.CommunityPagination').hide();
    getData("articles", query, "news", "desc", 1, 10, false, posttopicID);
    $('.resultTypes').text('News');
  } else {
    $('#HelpCentreResults').hide();
  }
  // Next or previous button pressed
  // Radio buttons pressed
  $('.hcradiolabeloptions input').click(function(e) {
    newPage = 1;
  })
  $('.next,.prev').click(function(e) {
    // Empty the results before displaying the new
    $("#sresults").empty();
    // Decrement for Previous Page.
    if ($(this).hasClass('prev')) {
      $(window).scrollTop(0);
      e.preventDefault();
      newPage--;
    }
    // Increment for Next Page.
    if ($(this).hasClass('next')) {
      $(window).scrollTop(0);
      e.preventDefault();
      newPage++;
    }
    // Clamp pagination lower limit.
    if (newPage < 1) {
      newPage = 1;
    }
    // Clamp pagination max limit.
    if (newPage > maxPageNumber) {
      newPage = maxPageNumber;
    }
    // Get the selected checkbox ID's.
    var selected = '';
    $('.hcradiolabeloptions input[checked="checked"]').each(function() {
      alert('true');
      selected = ($(this).attr('value'));
    });
    // Convert to comma separated array.
    var sectionIDCS = selected;
    var query = "{{query}}";
    //Finish the code for the next page
    var posttopicID = "";
    if (currentPageType === "All types" || currentPageType === "Articles") {
      getData(pageType, query, sectionIDCS, "desc", newPage, numberPerPage, true, posttopicID);
    } else {
      $('#ShowingArticleCount').text("Showing page 0 of 0");
      $("#sresults").empty();
      $("#sresults").append(noResultsFoundHTML);
      $('.pagination-prev').hide();
      $('.pagination-next').hide();
    }
  });
}
/* END search_results.hbs */
/* START front door functions */
var myCalendar;
var calendarData = [];
var $dateListItemTemplage = $('[data-date-template]').clone();
var $dateFlaggedItemTemplage = $('[data-flagged-template]').clone();

function getCalendarData(apiKey, dataSource, attempt) {
  if (!attempt) {
    attempt = 1;
  }
  $.get(`https://sheets.googleapis.com/v4/spreadsheets/${dataSource}/values/sheet1?key=${apiKey}`, function(data) {
    // parse spreadsheet data to JSON
    data.values.forEach((item, index) => {
      if (index) {
        calendarData.push({
          date: item[0].substr(6, 4) + '-' + item[0].substr(3, 2) + '-' + item[0].substr(0, 2),
          title: item[1],
          description: item[2],
          flagged: item[3] == 'Yes' ? true : false
        });
      }
    });
    // sort into date order
    calendarData.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0));
    // build the calendar and flagged dates
    calendarInit();
    buildFlaggedDates();
    $(window).resize(function() {
      $('[data-set-min-height]').css('min-height', 'auto');
    });
    $('[data-calendar-state="loading"]').hide();
    $('[data-calendar-state="loaded"]').addClass('event-wrapper--show');
  }).fail(function() {
    if (attempt < 5) {
      setTimeout(function() {
        attempt++;
        getCalendarData(apiKey, dataSource, attempt);
      }, 2000);
    } else {
      $('[data-calendar-state="loading"]').hide();
      $('[data-calendar-state="error"]').show();
    }
  });
}

function calendarInit() {
  // get current date
  var currentDate = moment().format('YYYY-MM-DD');
  // get unique list of dates with events
  var datesWithEvents = [...new Set(calendarData.map(item => item.date))];
  // create calendar, passing in a unique list of dates with events
  myCalendar = new TavoCalendar('#events-calendar', {
    selected: datesWithEvents
  });
  // get initial event list
  buildEventList(currentDate);
}

function updateEventListMonth(yearMonth) {
  buildEventList(yearMonth + '-01');
}

function updateEventListDay(yearMonthDay) {
  buildEventList(moment(yearMonthDay).format('YYYY-MM-DD'), true);
  // clear any other user selected dates
  $('.event-calendar__user-selected').removeClass('event-calendar__user-selected');
}

function buildEventList(date, dayOnly) {
  // clear any highlighted dates on the calendat
  $('.event-calendar__displaying-date').removeClass('event-calendar__displaying-date');
  // get date list and clear
  var $dateList = $('[data-dates]');
  $dateList.empty();
  // get no date message
  var $noDates = $('[data-no-dates]');
  // generate list of event elements
  var eventListElements = [];
  calendarData.forEach((item, index) => {
    if (!dayOnly || item.date === date) {
      var $newDateItem = $dateListItemTemplage.clone();
      $newDateItem.attr('data-date-index', index);
      $newDateItem.attr('data-event-date', item.date);
      $('[data-date-date]', $newDateItem).text(moment(item.date).format('DD MMMM YYYY'));
      $('[data-date-title]', $newDateItem).text(item.title);
      $('[data-date-description]', $newDateItem).text(item.description);
      $('[data-date-description-toggle]', $newDateItem).click(function(event) {
        event.preventDefault();
        toggleEventDescription(index)
      });
      if (dayOnly) {
        $newDateItem.removeClass('feature-panels__panel--front-door');
        $newDateItem.addClass('feature-panels__panel--dark');
      }
      eventListElements.push($newDateItem);
    }
  });
  // create page elements
  var $page = $('<div class="feature-panels feature-panels--small-margin event-list__page" />');
  var $currentPage = $page.clone();
  // make the first page the visible page
  $currentPage.addClass('event-list__page--current');
  // set flag for incomplete page
  var incompletePage = false;
  // get future date pages
  eventListElements.filter(item => moment(date).diff(item.attr('data-event-date'), 'days') < 1).forEach(($eventElement, index) => {
    $eventElement.appendTo($currentPage);
    incompletePage = true;
    // if current page, highlight date on calendar
    if ($currentPage.hasClass('event-list__page--current')) {
      $('[data-calendar-day-date="' + $eventElement.attr('data-event-date') + '"]').addClass('event-calendar__displaying-date');
    }
    // if three items on page, add page and create a new one
    if ((index + 1) % 3 === 0) {
      $currentPage.appendTo('[data-dates]');
      $currentPage = $page.clone();
      incompletePage = false;
    }
  });
  // if there is an incomplete page, add page as we have no more items
  if (incompletePage) {
    $currentPage.appendTo('[data-dates]');
    $currentPage = $page.clone();
    incompletePage = false;
  }
  // get past date pages
  eventListElements.filter(item => moment(date).diff(item.attr('data-event-date'), 'days') > 0).sort((a, b) => (a.attr('data-event-date') < b.attr('data-event-date')) ? 1 : ((b.attr('data-event-date') < a.attr('data-event-date')) ? -1 : 0)).forEach(($eventElement, index) => {
    $eventElement.prependTo($currentPage);
    incompletePage = true;
    // if current page, highlight date on calendar
    if ($currentPage.hasClass('event-list__page--current')) {
      $('[data-calendar-day-date="' + $eventElement.attr('data-event-date') + '"]').addClass('event-calendar__displaying-date');
    }
    // if three items on page, add page and create a new one
    if ((index + 1) % 3 === 0) {
      $currentPage.prependTo('[data-dates]');
      $currentPage = $page.clone();
      incompletePage = false;
    }
  });
  // if there is an incomplete page, add page as we have no more items
  if (incompletePage) {
    $currentPage.prependTo('[data-dates]');
    $currentPage = $page.clone();
    incompletePage = false;
  }
  setEventListPagination();
  // if any dates have been added, hide the no dates to display message
  if ($('.feature-panels', '[data-dates]').length > 0) {
    $noDates.hide();
  }
}

function setEventListPagination() {
  if ($('.feature-panels', '[data-dates]').length > 1) {
    $('[data-event-pagination]').show();
    var numberOfPages = $('.event-list__page', '[data-dates]').length;
    var currentPageIndex = $('.event-list__page--current', '[data-dates]').index();
    if (currentPageIndex === 0) {
      $('[data-event-pagination-direction="previous"]').parent().hide();
    } else {
      $('[data-event-pagination-direction="previous"]').parent().show();
    }
    if ((currentPageIndex + 1) === numberOfPages) {
      $('[data-event-pagination-direction="next"]').parent().hide();
    } else {
      $('[data-event-pagination-direction="next"]').parent().show();
    }
  } else {
    $('[data-event-pagination]').hide();
  }
}

function toggleEventDescription(index) {
  sizeSizer('calendar-list');
  $('[data-date-index="' + index + '"] [data-date-description-wrapper]').toggleClass('event-description-wrapper--expand');
  $('[data-date-index]:not([data-date-index="' + index + '"])').toggle();
}

function buildFlaggedDates() {
  // get flagged list and clear
  var $flaggedDates = $('[data-flagged-dates]');
  var $flaggedDatesList = $('[data-flagged-list]');
  var $flaggedDatesLink = $('[data-flagged-dates-link]');
  $flaggedDatesList.empty();
  calendarData.filter(item => item.flagged && moment().diff(item.date, 'days') < 1).forEach((item, index) => {
    var $newFlaggedItem = $dateFlaggedItemTemplage.clone();
    $newFlaggedItem.attr('data-flagged-index', index);
    $('[data-flagged-date]', $newFlaggedItem).text(moment(item.date).format('DD MMMM YYYY'));
    $('[data-flagged-title]', $newFlaggedItem).text(item.title);
    $('[data-flagged-description]', $newFlaggedItem).text(item.description);
    $('[data-flagged-description-toggle]', $newFlaggedItem).click(function(event) {
      event.preventDefault();
      toggleFlaggedDescription(index)
    });
    $newFlaggedItem.appendTo($flaggedDatesList);
    $flaggedDates.show();
    $flaggedDatesLink.css('display', 'inline-block');
  });
}

function toggleFlaggedDescription(index) {
  sizeSizer('flagged-dates');
  $('[data-flagged-index="' + index + '"] [data-flagged-description-wrapper]').toggleClass('event-description-wrapper--expand');
  $('[data-flagged-index]:not([data-flagged-index="' + index + '"])').toggle();
}
$('[data-event-pagination-direction]').click(function(event) {
  event.preventDefault();
  var dateInView;
  sizeSizer('calendar-list');
  // get the current page index
  var currentPageIndex = $('.event-list__page--current', '[data-dates]').index();
  // set the requested page index
  if ($(this).attr('data-event-pagination-direction') === 'next') {
    currentPageIndex++;
  } else {
    currentPageIndex--;
  }
  // hide the current page and show the requested page
  $('.event-list__page--current', '[data-dates]').removeClass('event-list__page--current');
  $('.event-list__page', '[data-dates]').eq(currentPageIndex).addClass('event-list__page--current');
  // reset the pagination
  setEventListPagination();
  // make sure no events are expanded
  $('.event-description-wrapper--expand').removeClass('event-description-wrapper--expand');
  $('[data-date-index]').show();
  // clear highlighted dates on calendar
  $('.event-calendar__displaying-date').removeClass('event-calendar__displaying-date');
  // get calendar to show date
  if ($(this).attr('data-event-pagination-direction') === 'next') {
    dateInView = $('.event-list__page--current [data-event-date]', '[data-dates]').first().attr('data-event-date');
  } else {
    dateInView = $('.event-list__page--current [data-event-date]', '[data-dates]').last().attr('data-event-date');
  }
  myCalendar.setFocusYear(moment(dateInView).format('YYYY'));
  myCalendar.setFocusMonth(moment(dateInView).format('MM'));
  // loop dates on current page and highlight on calendar
  $('.event-list__page', '[data-dates]').eq(currentPageIndex).find('[data-event-date]').each(function() {
    $('[data-calendar-day-date="' + $(this).attr('data-event-date') + '"]').addClass('event-calendar__displaying-date');
  });
});

function sizeSizer(sizerId) {
  $('[data-set-min-height="' + sizerId + '"]').css('min-height', $('[data-set-min-height="' + sizerId + '"]').height());
}

function frontDoor(apiKey, dataSource) {
  getCalendarData(apiKey, dataSource);
  $(window).scroll(function() {
    if ($(this).scrollTop() > 400) {
      $('[data-scroll-to-top]').addClass('scroll-to-top--show');
    } else {
      $('[data-scroll-to-top]').removeClass('scroll-to-top--show');
    }
  });
  $('[data-scroll-to-top]').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 500);
    return false;
  });
  $('[data-accordion-link]').click(function(e) {
    e.preventDefault();
    var sectionName = $(this).attr('data-accordion-link');
    $(this).find('[data-accordion-state]').text(function(i, text) {
      return text === 'Hide' ? 'Show' : 'Hide';
    });
    $('[data-accordion-body="' + sectionName + '"]').toggle();
    // save hide state to local storage
    var currentHideStoredState = localStorage.getItem('hide-' + sectionName) === null ? false : localStorage.getItem('hide-' + sectionName) === 'true';
    localStorage.setItem('hide-' + sectionName, !currentHideStoredState);
  });
  $('[data-scroll-to]').click(function(e) {
    e.preventDefault();
    // get requested section name
    var sectionName = $(this).attr('data-scroll-to');
    // scroll to section
    $('html, body').animate({
      scrollTop: $('#' + sectionName).offset().top
    }, 500);
    // make sure section is open
    $('[data-accordion-link="' + sectionName + '"]').find('span').text('Hide');
    $('[data-accordion-body="' + sectionName + '"]').show();
    // save hide state to local storeage
    localStorage.setItem('hide-' + sectionName, false);
  });
  // load section hide/show status from session storage
  $('[data-accordion-link]').each(function() {
    var sectionName = $(this).attr('data-accordion-link');
    if (localStorage.getItem('hide-' + sectionName) === 'true') {
      $(this).find('[data-accordion-state]').text(function(i, text) {
        return text === "Hide" ? "Show" : "Hide";
      });
      $('[data-accordion-body="' + sectionName + '"]').toggle();
    }
  });
}
/* END front door functions */
