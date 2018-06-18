exports.handler = function(event, context) {
  if( event.request.session ) {
    if (event.request.session.length == 1 && event.request.session[0].challengeName == 'SRP_A' && event.request.session[0].challengeResult == true) {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'PASSWORD_VERIFIER';
    } else if (event.request.session.length == 2 && event.request.session[1].challengeName == 'PASSWORD_VERIFIER' && event.request.session[1].challengeResult == true) {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'CUSTOM_CHALLENGE';
    } else if (event.request.session.length == 3 && event.request.session[2].challengeName == 'CUSTOM_CHALLENGE') {
        if( event.request.session[2].challengeResult == false) {
            //device was not validated, present the challenge
            event.response.issueTokens = false;
            event.response.failAuthentication = false;
            event.response.challengeName = 'CUSTOM_CHALLENGE';
        } else {
            //device was validated, give token
            event.response.issueTokens = true;
            event.response.failAuthentication = false;
        }
    } else if (event.request.session.length == 4 && event.request.session[3].challengeName == 'CUSTOM_CHALLENGE' && event.request.session[3].challengeResult == true) {
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    } else {
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    }
  } else {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }
  context.done(null, event);
}
