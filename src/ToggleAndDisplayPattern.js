const React = require("react");
const findDOMNode = require("react-dom").findDOMNode;
import {matchAnd} from "./utils/match-props";
export default class ToggleAndDisplayPattern extends React.Component {
    constructor(...args) {
        super(...args);
        this.wrapper = null;
        this._activeChildren = [];
        this._hiddenChildren = [];
    }

    getFlagNames() {
        return Object.keys(this.props).filter(key => {
            return key !== "children";
        });
    }

    /**
     * get components from `children` that matches key and value with own props.
     * @returns {ReactComponent[]}
     */
    mapComponents() {
        const children = [].concat(this.props.children);
        const flagKeyNames = this.getFlagNames();
        return children.map((child, index) => {
            if (!child.props) {
                return null;
            }
            // all match
            if (matchAnd(flagKeyNames, this.props, child.props)) {
                const newProps = {
                    key: index
                };
                newProps.ref = (c) => {
                    if (typeof child.ref === 'function') {
                        child.ref(c);
                    }
                    if (c) {
                        this._activeChildren.push(c);
                    }
                };
                return React.cloneElement(child, newProps);
            } else {
                const newProps = {
                    key: index
                };
                newProps.ref = (c) => {
                    if (typeof child.ref === 'function') {
                        child.ref(c);
                    }
                    if (c) {
                        this._hiddenChildren.push(c);
                    }
                };
                return React.cloneElement(child, newProps);
            }
        });
    }

    componentWillUpdate() {
        this._activeChildren = [];
        this._hiddenChildren = [];
    }

    componentDidMount() {
        this._updatePattens();
    }

    componentDidUpdate() {
        this._updatePattens();
    }

    render() {
        const components = this.mapComponents();
        if (components.length === 0) {
            return null;
        }
        return <span
            className="TogglePattern ToggleAndDisplayPattern"
            ref={(c) => this.wrapper = c}>
            {components}
        </span>;
    }

    _updatePattens() {
        const wrapper = findDOMNode(this.wrapper);
        let isActiveWrapper = false;
        // include focus element?
        if (wrapper) {
            const activeElement = document.activeElement;
            isActiveWrapper = wrapper.contains(activeElement);
        }
        this._activeChildren.forEach(child => {
            const childDOM = findDOMNode(child);
            if (childDOM) {
                childDOM.hidden = false;
            }
        });
        this._hiddenChildren.forEach(child => {
            const childDOM = findDOMNode(child);
            if (childDOM) {
                childDOM.hidden = true;
            }
        });
        // move to focus
        if (isActiveWrapper && this._activeChildren.length === 1) {
            const activeDOM = findDOMNode(this._activeChildren[0]);
            if (activeDOM && !activeDOM.contains(document.activeElement)) {
                activeDOM.focus();
            }
        }
    }
}

