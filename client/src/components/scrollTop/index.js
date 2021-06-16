import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class ScrollToTop extends Component {
	componentDidUpdate(prevProps) {
		if (prevProps.location !== this.props.location)
			window.scrollTo(0, 0);
	}

	render() {
		return <React.Fragment />
	};
}

export default withRouter(ScrollToTop)