"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.makePlugin = makePlugin;

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_OPTIONS = {
  commitDefaultValue: "unknown",
  tagDefaultValue: "unknown",

  commitConstantName: "GIT_COMMIT",
  tagConstantName: "GIT_TAG",
  releaseTagConstantName: "GIT_RELEASE_TAG",

  showDirty: false,

  commitLength: 40,
  tagCommitLength: 0
};

exports.default = makePlugin({ getCommit: getCommit, getTag: getTag, getReleaseTag: getReleaseTag });
function makePlugin(_ref) {
  var getCommit = _ref.getCommit,
      getTag = _ref.getTag,
      getReleaseTag = _ref.getReleaseTag;

  var commit = void 0;
  var tag = void 0;
  var releaseTag = void 0;
  var pluginOptions = void 0;

  return function (_ref2) {
    var t = _ref2.types;

    return {
      visitor: {
        Program: function Program(path, _ref3) {
          var options = _ref3.opts;

          pluginOptions = (0, _extends3.default)({}, DEFAULT_OPTIONS, options);

          commit = getCommit(pluginOptions);
          if (!commit) {
            commit = pluginOptions.commitDefaultValue;
          } else {
            commit = commit.substring(0, pluginOptions.commitLength);
          }

          tag = getTag(pluginOptions);
          if (!tag) {
            tag = pluginOptions.tagDefaultValue;
          }

          releaseTag = getReleaseTag();
          if (!releaseTag) {
            releaseTag = pluginOptions.tagDefaultValue;
          }
        },
        ReferencedIdentifier: function ReferencedIdentifier(path) {
          if (path.node.name === pluginOptions.commitConstantName) {
            path.replaceWith(t.stringLiteral(commit));
            return;
          }

          if (path.node.name === pluginOptions.tagConstantName) {
            path.replaceWith(t.stringLiteral(tag));
            return;
          }

          if (path.node.name === pluginOptions.releaseTagConstantName) {
            path.replaceWith(t.stringLiteral(releaseTag));
            return;
          }
        }
      }
    };
  };
}

function getCommit(opts) {
  try {
    return (0, _child_process.execSync)("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch (e) {
    return null;
  }
}

function getTag(opts) {
  try {
    var cmd = ["git describe", "--abbrev=" + opts.tagCommitLength, opts.showDirty ? "--dirty" : ""];
    return (0, _child_process.execSync)(cmd.join(" "), { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch (e) {
    return null;
  }
}

function getReleaseTag() {
  try {
    var cmd = "git describe --tags --exact-match `git rev-parse HEAD`";
    return (0, _child_process.execSync)(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch (e) {
    return null;
  }
}
