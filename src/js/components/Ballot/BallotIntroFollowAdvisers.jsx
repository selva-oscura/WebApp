import React, { Component, PropTypes } from "react";
import { Button } from "react-bootstrap";
import GuideActions from "../../actions/GuideActions";
import OrganizationFollowToggle from "./OrganizationFollowToggle";
import GuideStore from "../../stores/GuideStore";
import VoterStore from "../../stores/VoterStore";

const NEXT_BUTTON_TEXT = "Next >";
const SKIP_BUTTON_TEXT = "Skip >";
// const PREVIOUS_ADVISERS_PROMPT_TEXT = "Follow three or more advisers to get recommendations on your ballot.";


export default class BallotIntroFollowAdvisers extends Component {
  static propTypes = {
    history: PropTypes.object,
    next: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      description_text: "",
      followed_organizations: [],
      voter_guides_to_follow_by_issues_followed: GuideStore.getVoterGuidesToFollowByIssuesFollowed(),
      voter_guides_to_follow_all: GuideStore.getVoterGuidesToFollowAll(),
      next_button_text: NEXT_BUTTON_TEXT
    };

    this.onOrganizationFollow = this.onOrganizationFollow.bind(this);
    this.onOrganizationStopFollowing = this.onOrganizationStopFollowing.bind(this);
    this.onNext = this.onNext.bind(this);
  }

  componentDidMount () {
    GuideActions.retrieveGuidesToFollowByIssuesFollowed();
    GuideActions.retrieveGuidesToFollow(VoterStore.election_id());
    this._onGuideStoreChange();
    this.guideStoreListener = GuideStore.addListener(this._onGuideStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.guideStoreListener.remove();
  }

  _onGuideStoreChange () {
    this.setState({
      voter_guides_to_follow_by_issues_followed: GuideStore.getVoterGuidesToFollowByIssuesFollowed(),
      voter_guides_to_follow_all: GuideStore.getVoterGuidesToFollowAll()
    });
  }

  onOrganizationFollow (organization_we_vote_id) {
    let index = this.state.followed_organizations.indexOf(organization_we_vote_id);
    if (index === -1) {
      var new_followed_organizations = this.state.followed_organizations;
      new_followed_organizations.push(organization_we_vote_id);
      this.setState({
        description_text: "",
        followed_organizations: new_followed_organizations,
        next_button_text: NEXT_BUTTON_TEXT
      });
    }
  }

  onOrganizationStopFollowing (organization_we_vote_id) {
    let index = this.state.followed_organizations.indexOf(organization_we_vote_id);
    if (index > -1) {
      var new_followed_organizations = this.state.followed_organizations;
      new_followed_organizations.splice(index, 1);
      if (new_followed_organizations.length === 0) {
        this.setState({
          description_text: "",
          followed_organizations: new_followed_organizations,
          next_button_text: NEXT_BUTTON_TEXT,
        });
      } else {
        this.setState({
          followed_organizations: new_followed_organizations,
        });
      }
    }
  }

  onNext () {
    var organization_followed_length = this.state.followed_organizations.length;
    if (organization_followed_length > 0 || this.state.next_button_text === SKIP_BUTTON_TEXT) {
      this.props.next();
    } else if (organization_followed_length === 0) {
      const SELECT_ORGANIZATION_PROMPT = "Are you sure you don't want to follow at least one organization that " +
        "shares your values? Following will show you recommendations on your ballot.";
      this.setState({
        description_text: SELECT_ORGANIZATION_PROMPT,
        next_button_text: SKIP_BUTTON_TEXT,
      });
    }
  }

  render () {
    // These are the organizations that a voter might want to follow based on the issues the voter is following.
    let voter_guides_to_follow_by_issues_followed = [];
    if (this.state.voter_guides_to_follow_by_issues_followed) {
      voter_guides_to_follow_by_issues_followed = this.state.voter_guides_to_follow_by_issues_followed;
    }

    const voter_guides_to_follow_by_issues_for_display = voter_guides_to_follow_by_issues_followed.map((voter_guide) => {
      return <OrganizationFollowToggle
        key={voter_guide.organization_we_vote_id}
        organization_we_vote_id={voter_guide.organization_we_vote_id}
        organization_name={voter_guide.voter_guide_display_name}
        organization_description={voter_guide.twitter_description}
        organization_image_url={voter_guide.voter_guide_image_url_medium}
        on_organization_follow={this.onOrganizationFollow}
        on_organization_stop_following={this.onOrganizationStopFollowing}
        />;
    });

    // These are organizations based on the upcoming election
    let voter_guides_to_follow_all = [];
    if (this.state.voter_guides_to_follow_all) {
      voter_guides_to_follow_all = this.state.voter_guides_to_follow_all;
    }
    const voter_guides_to_follow_all_for_display = voter_guides_to_follow_all.map((voter_guide) => {
      return <OrganizationFollowToggle
        key={voter_guide.organization_we_vote_id}
        organization_we_vote_id={voter_guide.organization_we_vote_id}
        organization_name={voter_guide.voter_guide_display_name}
        organization_description={voter_guide.twitter_description}
        organization_image_url={voter_guide.voter_guide_image_url_medium}
        on_organization_follow={this.onOrganizationFollow}
        on_organization_stop_following={this.onOrganizationStopFollowing}
        />;
    });

    return <div className="intro-modal">
      <div className="intro-modal__h1">Follow Organizations</div>
      { voter_guides_to_follow_by_issues_for_display.length > 0 ?
        <div>
          <div className="intro-modal-vertical-scroll-contain">
            <div className="intro-modal-vertical-scroll card">
              { voter_guides_to_follow_by_issues_for_display.length > 0 ?
                voter_guides_to_follow_by_issues_for_display :
                <h4>No organizations to display</h4>
              }
            </div>
          </div>
          <div className="intro-modal-description-text">
            { this.state.description_text ?
              this.state.description_text :
              <span>Great work! Based on your issues, these organizations or people
                might share your values. Follow them for recommendations.</span>
            }
          </div>
        </div> :
        <div>
          <div className="intro-modal-vertical-scroll-contain">
            <div className="intro-modal-vertical-scroll card">
              { voter_guides_to_follow_all_for_display.length > 0 ?
                voter_guides_to_follow_all_for_display :
                <h4>No organizations to display</h4>
              }
            </div>
          </div>
          <div className="intro-modal__description-text">
            { this.state.description_text ?
              this.state.description_text :
              <span>These organizations or people provide voter guides. Follow them for recommendations.</span>
            }
          </div>
        </div>
      }
      <br/>
      <div className="intro-modal__button-wrap">
        <Button type="submit" className="btn btn-success intro-modal__button" onClick={this.onNext}>
          <span>{this.state.next_button_text}</span>
        </Button>
      </div>
    </div>;
  }
}
