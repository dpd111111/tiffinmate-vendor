var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
          case REACT_VIEW_TRANSITION_TYPE:
            return "ViewTransition";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var resolveDebugValue = null, rejectDebugValue = null, ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now(), ioInfo.value = new Promise(function(resolve, reject) {
            resolveDebugValue = resolve;
            rejectDebugValue = reject;
          }));
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                if (null != _ioInfo) {
                  _ioInfo.end = performance.now();
                  var debugValue = null == moduleObject ? void 0 : moduleObject.default;
                  resolveDebugValue(debugValue);
                  _ioInfo.value.status = "fulfilled";
                  _ioInfo.value.value = debugValue;
                }
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now(), _ioInfo2.value.then(noop, noop), rejectDebugValue(error), _ioInfo2.value.status = "rejected", _ioInfo2.value.reason = error);
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function startTransition(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition.types = null !== prevTransition ? prevTransition.types : null;
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      }
      function addTransitionType(type) {
        var transition = ReactSharedInternals.T;
        if (null !== transition) {
          var transitionTypes = transition.types;
          null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
        } else
          0 === ReactSharedInternals.asyncTransitions && console.error(
            "addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."
          ), startTransition(addTransitionType.bind(null, type));
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = /* @__PURE__ */ Symbol.for("react.view_transition"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.addTransitionType = addTransitionType;
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        var propName;
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        (propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++) ? (childArray = Error.stackTraceLimit, Error.stackTraceLimit = 10, childrenLength = Error("react-stack-top-frame"), Error.stackTraceLimit = childArray) : childrenLength = unknownOwnerDebugStack;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          childrenLength,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = startTransition;
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.3.0";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
    "use strict";
    (function() {
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
          case REACT_VIEW_TRANSITION_TYPE:
            return "ViewTransition";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          maybeKey,
          getOwner(),
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      var React2 = require_react(), REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = /* @__PURE__ */ Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React2 = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React2.react_stack_bottom_frame.bind(
        React2,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
          var previousStackTraceLimit = Error.stackTraceLimit;
          Error.stackTraceLimit = 10;
          var debugStackDEV = Error("react-stack-top-frame");
          Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          debugStackDEV,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.jsxs = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
          var previousStackTraceLimit = Error.stackTraceLimit;
          Error.stackTraceLimit = 10;
          var debugStackDEV = Error("react-stack-top-frame");
          Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          debugStackDEV,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    })();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_jsx_runtime_development();
    }
  }
});

// management/vendor/vendor_portal_app.tsx
var import_react = __toESM(require_react(), 1);

// management/vendor/vendor_rate_card_data.ts
var VENDOR_MASTER_RATE_CARD = [
  // --- MONDAY ---
  {
    id: "mon_aloo_matar",
    name: "Aloo Matar",
    hindiName: "\u0906\u0932\u0942 \u092E\u091F\u0930",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "mon_yellow_dal_tadka",
    name: "Yellow Dal Tadka",
    hindiName: "\u092F\u0947\u0932\u094B \u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "mon_kadhai_paneer",
    name: "Kadhai Paneer",
    hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "mon_kadhai_paneer_rice_bowl",
    name: "Kadhai Paneer with Rice Bowl",
    hindiName: "\u0915\u0922\u093C\u093E\u0908 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "mon_yellow_dal_rice_bowl",
    name: "Yellow Dal Tadka with Rice Bowl",
    hindiName: "\u0926\u093E\u0932 \u0924\u0921\u093C\u0915\u093E \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "mon_aloo_matar_rice_bowl",
    name: "Aloo Matar with Rice Bowl",
    hindiName: "\u0906\u0932\u0942 \u092E\u091F\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 55 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "mon_daily_thali",
    name: "Monday Daily Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }
    ],
    inStock: true
  },
  {
    id: "mon_deluxe_thali",
    name: "Monday Deluxe Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }
    ],
    inStock: true
  },
  {
    id: "mon_premium_thali",
    name: "Monday Premium Thali",
    hindiName: "\u0938\u094B\u092E\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "monday",
    categoryLabel: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  // --- TUESDAY ---
  {
    id: "tue_bhindi_masala",
    name: "Bhindi Masala",
    hindiName: "\u092D\u093F\u0902\u0921\u0940 \u092E\u0938\u093E\u0932\u093E",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "tue_dal_fry",
    name: "Dal Fry",
    hindiName: "\u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "tue_shahi_paneer",
    name: "Shahi Paneer",
    hindiName: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "tue_shahi_paneer_rice_bowl",
    name: "Shahi Paneer with Rice Bowl",
    hindiName: "\u0936\u093E\u0939\u0940 \u092A\u0928\u0940\u0930 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "tue_dal_fry_rice_bowl",
    name: "Dal Fry with Rice Bowl",
    hindiName: "\u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908 \u0935\u093F\u0925 \u0930\u093E\u0907\u0938 \u092C\u093E\u0909\u0932",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 229, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 319, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "tue_daily_thali",
    name: "Tuesday Daily Thali",
    hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "tue_deluxe_thali",
    name: "Tuesday Deluxe Thali",
    hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "tue_premium_thali",
    name: "Tuesday Premium Thali",
    hindiName: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "tuesday",
    categoryLabel: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- WEDNESDAY ---
  {
    id: "wed_lauki_kofta",
    name: "Lauki Kofta / Dum Aloo",
    hindiName: "\u0932\u094C\u0915\u0940 \u0915\u094B\u092B\u094D\u0924\u093E / \u0926\u092E \u0906\u0932\u0942",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "wed_moong_dal_fry",
    name: "Moong Dal Fry",
    hindiName: "\u092E\u0942\u0902\u0917 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "wed_paneer_do_pyaza",
    name: "Paneer Do Pyaza",
    hindiName: "\u092A\u0928\u0940\u0930 \u0926\u094B \u092A\u094D\u092F\u093E\u091C\u093C\u093E",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "wed_daily_thali",
    name: "Wednesday Daily Thali",
    hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "wed_deluxe_thali",
    name: "Wednesday Deluxe Thali",
    hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "wed_premium_thali",
    name: "Wednesday Premium Thali",
    hindiName: "\u092C\u0941\u0927\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "wednesday",
    categoryLabel: "\u092C\u0941\u0927\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- THURSDAY ---
  {
    id: "thu_kadhi_pakoda",
    name: "Kadhi Pakoda",
    hindiName: "\u0915\u0922\u093C\u0940 \u092A\u0915\u094B\u0921\u093C\u093E",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 80 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 120 }
    ],
    inStock: true
  },
  {
    id: "thu_chana_dal_fry",
    name: "Chana Dal Fry",
    hindiName: "\u091A\u0928\u093E \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 70 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 105 }
    ],
    inStock: true
  },
  {
    id: "thu_palak_paneer",
    name: "Palak Paneer",
    hindiName: "\u092A\u093E\u0932\u0915 \u092A\u0928\u0940\u0930",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 169, vendorPayoutRate: 65 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 95 },
      { size: "Full", listingPrice: 349, vendorPayoutRate: 130 }
    ],
    inStock: true
  },
  {
    id: "thu_daily_thali",
    name: "Thursday Daily Thali",
    hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "thu_deluxe_thali",
    name: "Thursday Deluxe Thali",
    hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "thu_premium_thali",
    name: "Thursday Premium Thali",
    hindiName: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "thursday",
    categoryLabel: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- FRIDAY ---
  {
    id: "fri_baingan_bharta",
    name: "Baingan Bharta",
    hindiName: "\u092C\u0948\u0902\u0917\u0928 \u092D\u0930\u0924\u093E",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 55 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 140 }
    ],
    inStock: true
  },
  {
    id: "fri_butter_dal_fry",
    name: "Butter Dal Fry",
    hindiName: "\u092C\u091F\u0930 \u0926\u093E\u0932 \u092B\u094D\u0930\u093E\u0908",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 129, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Full", listingPrice: 299, vendorPayoutRate: 110 }
    ],
    inStock: true
  },
  {
    id: "fri_paneer_bhurji",
    name: "Paneer Bhurji",
    hindiName: "\u092A\u0928\u0940\u0930 \u092D\u0941\u0930\u094D\u091C\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 199, vendorPayoutRate: 75 },
      { size: "Half", listingPrice: 299, vendorPayoutRate: 115 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 150 }
    ],
    inStock: true
  },
  {
    id: "fri_daily_thali",
    name: "Friday Daily Thali",
    hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "fri_deluxe_thali",
    name: "Friday Deluxe Thali",
    hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "fri_premium_thali",
    name: "Friday Premium Thali",
    hindiName: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "friday",
    categoryLabel: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- SATURDAY ---
  {
    id: "sat_aloo_gobi",
    name: "Aloo Gobi",
    hindiName: "\u0906\u0932\u0942 \u0917\u094B\u092D\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 249, vendorPayoutRate: 85 },
      { size: "Full", listingPrice: 399, vendorPayoutRate: 135 }
    ],
    inStock: true
  },
  {
    id: "sat_butter_paneer_masala",
    name: "Butter Paneer Masala",
    hindiName: "\u092C\u091F\u0930 \u092A\u0928\u0940\u0930 \u092E\u0938\u093E\u0932\u093E",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 159, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "sat_daily_thali",
    name: "Saturday Daily Thali",
    hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "sat_deluxe_thali",
    name: "Saturday Deluxe Thali",
    hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "sat_premium_thali",
    name: "Saturday Premium Thali",
    hindiName: "\u0936\u0928\u093F\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "saturday",
    categoryLabel: "\u0936\u0928\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- SUNDAY ---
  {
    id: "sun_aloo_jeera",
    name: "Aloo Jeera",
    hindiName: "\u0906\u0932\u0942 \u091C\u0940\u0930\u093E",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 99, vendorPayoutRate: 50 },
      { size: "Half", listingPrice: 169, vendorPayoutRate: 60 },
      { size: "Full", listingPrice: 249, vendorPayoutRate: 90 }
    ],
    inStock: true
  },
  {
    id: "sun_matar_paneer",
    name: "Matar Paneer",
    hindiName: "\u092E\u091F\u0930 \u092A\u0928\u0940\u0930",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [
      { size: "Quarter", listingPrice: 159, vendorPayoutRate: 60 },
      { size: "Half", listingPrice: 239, vendorPayoutRate: 90 },
      { size: "Full", listingPrice: 329, vendorPayoutRate: 125 }
    ],
    inStock: true
  },
  {
    id: "sun_daily_thali",
    name: "Sunday Daily Thali",
    hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0921\u0947\u0932\u0940 \u0925\u093E\u0932\u0940",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "sun_deluxe_thali",
    name: "Sunday Deluxe Thali",
    hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0921\u0940\u0932\u0915\u094D\u0938 \u0925\u093E\u0932\u0940",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "sun_premium_thali",
    name: "Sunday Premium Thali",
    hindiName: "\u0930\u0935\u093F\u0935\u093E\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0925\u093E\u0932\u0940",
    category: "sunday",
    categoryLabel: "\u0930\u0935\u093F\u0935\u093E\u0930 \u0915\u093E \u092E\u0947\u0928\u0942",
    portions: [{ size: "Standard", listingPrice: 399, vendorPayoutRate: 135 }],
    inStock: true
  },
  // --- SPECIAL DAILY THALIS ---
  {
    id: "spl_veg_biryani_thali",
    name: "Veg Biryani Thali (Biryani + Salad)",
    hindiName: "\u0935\u0947\u091C \u092C\u093F\u0930\u092F\u093E\u0928\u0940 \u0925\u093E\u0932\u0940 (\u092C\u093F\u0930\u092F\u093E\u0928\u0940 + \u0938\u0932\u093E\u0926)",
    category: "special_thali",
    categoryLabel: "\u0935\u093F\u0936\u0947\u0937 \u0926\u0948\u0928\u093F\u0915 \u0925\u093E\u0932\u0940",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 95 }],
    inStock: true
  },
  {
    id: "spl_no_onion_garlic_thali",
    name: "Thali without Onion Garlic with Desi Ghee",
    hindiName: "\u092C\u093F\u0928\u093E \u092A\u094D\u092F\u093E\u091C \u0932\u0939\u0938\u0941\u0928 \u0925\u093E\u0932\u0940 (\u0936\u0941\u0926\u094D\u0927 \u0926\u0947\u0938\u0940 \u0918\u0940)",
    category: "special_thali",
    categoryLabel: "\u0935\u093F\u0936\u0947\u0937 \u0926\u0948\u0928\u093F\u0915 \u0925\u093E\u0932\u0940",
    portions: [{ size: "Standard", listingPrice: 289, vendorPayoutRate: 90 }],
    inStock: true
  },
  // --- BREAKFAST & SNACKS ---
  {
    id: "brk_aloo_paratha",
    name: "2 Aloo Paratha + Raita/Chutney",
    hindiName: "2 \u0906\u0932\u0942 \u092A\u0930\u093E\u0920\u093E + \u0930\u093E\u092F\u0924\u093E/\u091A\u091F\u0928\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 189, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "brk_paneer_paratha",
    name: "2 Paneer Paratha + Raita/Chutney",
    hindiName: "2 \u092A\u0928\u0940\u0930 \u092A\u0930\u093E\u0920\u093E + \u0930\u093E\u092F\u0924\u093E/\u091A\u091F\u0928\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 75 }],
    inStock: true
  },
  {
    id: "brk_gobi_paratha",
    name: "2 Gobi Paratha + Sauce/Chutney/Raita",
    hindiName: "2 \u0917\u094B\u092D\u0940 \u092A\u0930\u093E\u0920\u093E + \u091A\u091F\u0928\u0940/\u0930\u093E\u092F\u0924\u093E",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 219, vendorPayoutRate: 65 }],
    inStock: true
  },
  {
    id: "brk_veg_chilla",
    name: "Veg Chilla (2 Pcs) + Sauce",
    hindiName: "\u0935\u0947\u091C \u091A\u0940\u0932\u093E (2 \u092A\u0940\u0938) + \u0938\u0949\u0938",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_aloo_kachori",
    name: "Aloo Kachori (2 Pcs) + Chutney",
    hindiName: "\u0906\u0932\u0942 \u0915\u091A\u094C\u0921\u093C\u0940 (2 \u092A\u0940\u0938) + \u091A\u091F\u0928\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_sandwich",
    name: "Veg Sandwich (2 Pc - Plain)",
    hindiName: "\u0935\u0947\u091C \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 119, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_grilled_sandwich",
    name: "Veg Grilled Sandwich (2 Pc)",
    hindiName: "\u0935\u0947\u091C \u0917\u094D\u0930\u093F\u0932\u094D\u0921 \u0938\u0948\u0902\u0921\u0935\u093F\u091A (2 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_veg_burger",
    name: "Veg Burger (1 Pc)",
    hindiName: "\u0935\u0947\u091C \u092C\u0930\u094D\u0917\u0930 (1 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 129, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_cheese_burger",
    name: "Cheese Burger (1 Pc)",
    hindiName: "\u091A\u0940\u091C\u093C \u092C\u0930\u094D\u0917\u0930 (1 \u092A\u0940\u0938)",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 55 }],
    inStock: true
  },
  {
    id: "brk_poha_combo",
    name: "Veg Poha (250 g) + Desi Chai Combo",
    hindiName: "\u0935\u0947\u091C \u092A\u094B\u0939\u093E (250g) + \u0926\u0947\u0938\u0940 \u091A\u093E\u092F \u0915\u0949\u092E\u094D\u092C\u094B",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_upma_dahi",
    name: "Veg Rawa Upma + Dahi",
    hindiName: "\u0935\u0947\u091C \u0930\u0935\u093E \u0909\u092A\u092E\u093E + \u0926\u0939\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 159, vendorPayoutRate: 50 }],
    inStock: true
  },
  {
    id: "brk_korean_maggi",
    name: "Korean Maggi",
    hindiName: "\u0915\u094B\u0930\u093F\u092F\u0928 \u092E\u0948\u0917\u0940",
    category: "breakfast_snacks",
    categoryLabel: "\u0928\u093E\u0936\u094D\u0924\u093E \u090F\u0935\u0902 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 149, vendorPayoutRate: 50 }],
    inStock: true
  },
  // --- VRAT SPECIAL ---
  {
    id: "vrat_delux_thali",
    name: "Delux Vrat Thali (Samak rice + aloo paneer + 2 kuttu chilla + raita)",
    hindiName: "\u0921\u0940\u0932\u0915\u094D\u0938 \u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 (\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 + \u0906\u0932\u0942 \u092A\u0928\u0940\u0930 + 2 \u0915\u0941\u091F\u094D\u091F\u0942 \u091A\u0940\u0932\u093E + \u0930\u093E\u092F\u0924\u093E)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 299, vendorPayoutRate: 100 }],
    inStock: true
  },
  {
    id: "vrat_classic_thali",
    name: "Classic Vrat Thali (Samak rice + aloo sabji + 2 kuttu chilla + raita)",
    hindiName: "\u0915\u094D\u0932\u093E\u0938\u093F\u0915 \u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 (\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 + \u0906\u0932\u0942 \u0938\u092C\u094D\u091C\u093C\u0940 + 2 \u0915\u0941\u091F\u094D\u091F\u0942 \u091A\u0940\u0932\u093E + \u0930\u093E\u092F\u0924\u093E)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "vrat_samak_khichdi",
    name: "Samak Rice Khichdi Thali",
    hindiName: "\u0938\u092E\u093E\u0915 \u0930\u093E\u0907\u0938 \u0916\u093F\u091A\u0921\u093C\u0940 \u0925\u093E\u0932\u0940",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  {
    id: "vrat_sabudana_khichdi",
    name: "Sabudana Khichdi + Raita Thali",
    hindiName: "\u0938\u093E\u092C\u0942\u0926\u093E\u0928\u093E \u0916\u093F\u091A\u0921\u093C\u0940 + \u0930\u093E\u092F\u0924\u093E \u0925\u093E\u0932\u0940",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 239, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "vrat_aloo_pakoda_thali",
    name: "Aloo Pakoda Vrat Thali (6 Pcs)",
    hindiName: "\u0906\u0932\u0942 \u092A\u0915\u094B\u0921\u093C\u093E \u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 (6 \u092A\u0940\u0938)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 239, vendorPayoutRate: 80 }],
    inStock: true
  },
  {
    id: "vrat_singhara_halwa",
    name: "Singhara Atta Halwa (250 ml)",
    hindiName: "\u0938\u093F\u0902\u0918\u093E\u0921\u093C\u093E \u0906\u091F\u093E \u0939\u0932\u0935\u093E (250 ml)",
    category: "vrat_special",
    categoryLabel: "\u0935\u094D\u0930\u0924 \u0925\u093E\u0932\u0940 \u090F\u0935\u0902 \u0935\u094D\u0930\u0924 \u0938\u094D\u0928\u0948\u0915\u094D\u0938",
    portions: [{ size: "Standard", listingPrice: 249, vendorPayoutRate: 85 }],
    inStock: true
  },
  // --- BREADS, RICE & DESSERTS ---
  {
    id: "brd_tawa_roti",
    name: "Tawa Roti / Butter Tawa Roti",
    hindiName: "\u0924\u0935\u093E \u0930\u094B\u091F\u0940 / \u092C\u091F\u0930 \u0924\u0935\u093E \u0930\u094B\u091F\u0940",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "Per Pc", listingPrice: 12, vendorPayoutRate: 4 },
      { size: "Quarter", listingPrice: 15, vendorPayoutRate: 5 }
      // Butter
    ],
    inStock: true
  },
  {
    id: "brd_butter_ajwain_paratha",
    name: "Butter Ajwain Paratha",
    hindiName: "\u092C\u091F\u0930 \u0905\u091C\u0935\u093E\u0907\u0928 \u092A\u0930\u093E\u0920\u093E",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [{ size: "Per Pc", listingPrice: 25, vendorPayoutRate: 10 }],
    inStock: true
  },
  {
    id: "brd_plain_rice",
    name: "Plain Rice (300 g) / Jeera Rice (300 g)",
    hindiName: "\u092A\u094D\u0932\u0947\u0928 \u0930\u093E\u0907\u0938 / \u091C\u0940\u0930\u093E \u0930\u093E\u0907\u0938 (300g)",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "300g", listingPrice: 79, vendorPayoutRate: 50 },
      { size: "Standard", listingPrice: 89, vendorPayoutRate: 50 }
      // Jeera Rice
    ],
    inStock: true
  },
  {
    id: "brd_sweet_kheer",
    name: "Sweet Kheer",
    hindiName: "\u092E\u0940\u0920\u0940 \u0916\u0940\u0930",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "300g", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "500g", listingPrice: 229, vendorPayoutRate: 80 },
      { size: "700g", listingPrice: 329, vendorPayoutRate: 115 }
    ],
    inStock: true
  },
  {
    id: "brd_suji_halwa",
    name: "Suji Halwa",
    hindiName: "\u0938\u0942\u091C\u0940 \u0939\u0932\u0935\u093E",
    category: "breads_desserts",
    categoryLabel: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0914\u0930 \u092E\u0940\u0920\u093E",
    portions: [
      { size: "300g", listingPrice: 149, vendorPayoutRate: 50 },
      { size: "500g", listingPrice: 229, vendorPayoutRate: 75 },
      { size: "700g", listingPrice: 329, vendorPayoutRate: 110 }
    ],
    inStock: true
  }
];

// management/vendor/vendor_portal_app.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function VendorPortalApp({ activeVendorUser, onLogout }) {
  const [activeTab, setActiveTab] = (0, import_react.useState)("home");
  const [orders, setOrders] = (0, import_react.useState)([]);
  const [rateCard, setRateCard] = (0, import_react.useState)(VENDOR_MASTER_RATE_CARD);
  const [wallet, setWallet] = (0, import_react.useState)({
    currentBalance: 5480,
    minimumReserve: 2e3,
    tenDayHoldAmount: 1850,
    eligibleMondayPayout: 1630,
    lastSettlementDate: "2026-10-19",
    billingCycle: "Friday to Thursday",
    payoutDay: "Monday"
  });
  const [transactions, setTransactions] = (0, import_react.useState)([]);
  const [inventory, setInventory] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [successMsg, setSuccessMsg] = (0, import_react.useState)("");
  const [errorMsg, setErrorMsg] = (0, import_react.useState)("");
  const [showPunchModal, setShowPunchModal] = (0, import_react.useState)(false);
  const [punchSource, setPunchSource] = (0, import_react.useState)("zomato");
  const [punchOrderId, setPunchOrderId] = (0, import_react.useState)("");
  const [punchItemId, setPunchItemId] = (0, import_react.useState)(VENDOR_MASTER_RATE_CARD[0]?.id || "mon_daily_thali");
  const [punchPortionSize, setPunchPortionSize] = (0, import_react.useState)("Standard");
  const [punchQuantity, setPunchQuantity] = (0, import_react.useState)(1);
  const [punchTimeSlot, setPunchTimeSlot] = (0, import_react.useState)("Immediate (15-20 Mins)");
  const [punchNotes, setPunchNotes] = (0, import_react.useState)("");
  const [rateCategoryFilter, setRateCategoryFilter] = (0, import_react.useState)("all");
  const [rateSearchQuery, setRateSearchQuery] = (0, import_react.useState)("");
  const [orderSourceFilter, setOrderSourceFilter] = (0, import_react.useState)("all");
  const vendorId = activeVendorUser?.id || "NIR8800";
  const vendorName = activeVendorUser?.companyName || activeVendorUser?.name || "NIR Cloud Kitchen & Food Partner";
  const refreshData = async () => {
    try {
      setLoading(true);
      const ordRes = await fetch("/api/vendor/orders");
      if (ordRes.ok) {
        const d = await ordRes.json();
        if (d.orders) setOrders(d.orders);
      }
      const walRes = await fetch("/api/vendor/wallet");
      if (walRes.ok) {
        const d = await walRes.json();
        if (d.wallet) setWallet(d.wallet);
        if (d.transactions) setTransactions(d.transactions);
      }
      const invRes = await fetch("/api/vendor/inventory");
      if (invRes.ok) {
        const d = await invRes.json();
        if (d.inventory) setInventory(d.inventory);
      }
    } catch (err) {
      console.error("Failed to load vendor data:", err);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react.useEffect)(() => {
    refreshData();
    const interval = setInterval(refreshData, 2e4);
    return () => clearInterval(interval);
  }, []);
  const showToast = (msg, isErr = false) => {
    if (isErr) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 4e3);
  };
  const handlePunchSubmit = async (e) => {
    e.preventDefault();
    if (!punchOrderId.trim()) {
      showToast("\u0915\u0943\u092A\u092F\u093E \u092E\u093E\u0928\u094D\u092F Zomato/Swiggy \u0911\u0930\u094D\u0921\u0930 ID \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902", true);
      return;
    }
    try {
      const res = await fetch("/api/vendor/orders/punch-3p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: punchSource,
          platformOrderId: punchOrderId.trim(),
          itemId: punchItemId,
          portionSize: punchPortionSize,
          quantity: punchQuantity,
          timeSlot: punchTimeSlot,
          notes: punchNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "\u0911\u0930\u094D\u0921\u0930 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0926\u0930\u094D\u091C \u0939\u094B \u0917\u092F\u093E!");
        setShowPunchModal(false);
        setPunchOrderId("");
        setPunchNotes("");
        refreshData();
      } else {
        showToast(data.message || "\u0911\u0930\u094D\u0921\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F", true);
      }
    } catch (err) {
      showToast("\u0938\u0930\u094D\u0935\u0930 \u0915\u0928\u0947\u0915\u094D\u0936\u0928 \u0924\u094D\u0930\u0941\u091F\u093F", true);
    }
  };
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/vendor/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "\u0911\u0930\u094D\u0921\u0930 \u0938\u094D\u091F\u0947\u091F\u0938 \u0905\u092A\u0921\u0947\u091F \u0939\u0941\u0906");
        refreshData();
      } else {
        showToast(data.message || "\u0938\u094D\u091F\u0947\u091F\u0938 \u092C\u0926\u0932\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F", true);
      }
    } catch {
      showToast("\u0938\u0930\u094D\u0935\u0930 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0928\u0939\u0940\u0902 \u0939\u094B \u092A\u093E\u092F\u093E", true);
    }
  };
  const handleInventoryAdjust = async (itemId, change) => {
    try {
      const res = await fetch("/api/vendor/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, changeAmount: change })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        refreshData();
      }
    } catch {
      showToast("\u0907\u0928\u094D\u0935\u0947\u0902\u091F\u0930\u0940 \u0905\u092A\u0921\u0947\u091F \u0935\u093F\u092B\u0932", true);
    }
  };
  const selectedRateItem = rateCard.find((i) => i.id === punchItemId);
  const filteredRateCard = rateCard.filter((item) => {
    const matchesCat = rateCategoryFilter === "all" || item.category === rateCategoryFilter;
    const matchesSearch = !rateSearchQuery || item.name.toLowerCase().includes(rateSearchQuery.toLowerCase()) || item.hindiName.includes(rateSearchQuery);
    return matchesCat && matchesSearch;
  });
  const filteredOrders = orders.filter((o) => {
    if (orderSourceFilter === "all") return true;
    if (orderSourceFilter === "3p") return o.source !== "tiffin_website";
    if (orderSourceFilter === "tiffin") return o.source === "tiffin_website";
    return o.source === orderSourceFilter;
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-emerald-500 selection:text-white", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-xl shadow-md font-black", children: "\u{1F3EA}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950", children: "Vendor Partner OS" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs font-mono font-bold text-amber-400", children: [
                "ID: ",
                vendorId
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-md", children: vendorName })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 sm:gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-200", children: "Cloud Kitchen Active" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: () => {
                setShowPunchModal(true);
              },
              className: "px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hidden sm:inline", children: "3P \u0911\u0930\u094D\u0921\u0930 \u092A\u0902\u091A \u0915\u0930\u0947\u0902" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sm:hidden", children: "\u092A\u0902\u091A \u0915\u0930\u0947\u0902" })
              ]
            }
          ),
          onLogout && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: onLogout,
              className: "px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer",
              title: "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0932\u0949\u0917\u0906\u0909\u091F",
              children: "\u0932\u0949\u0917\u0906\u0909\u091F \u{1F6AA}"
            }
          )
        ] })
      ] }),
      successMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-emerald-600 text-white text-xs font-bold text-center py-2 px-4 shadow-sm animate-fade-in flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2705" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: successMsg })
      ] }),
      errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-red-600 text-white text-xs font-bold text-center py-2 px-4 shadow-sm animate-fade-in flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u26A0\uFE0F" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorMsg })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6", children: [
      activeTab === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 relative overflow-hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2728" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TiffinMate Cloud Kitchen Partner Hub" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-2xl sm:text-3xl font-black tracking-tight", children: [
                "\u0928\u092E\u0938\u094D\u0924\u0947, ",
                vendorName
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs sm:text-sm text-slate-300 max-w-xl", children: "\u091C\u093C\u094B\u092E\u0948\u091F\u094B \u0935 \u0938\u094D\u0935\u0940\u0917\u0940 \u0915\u0947 3rd-\u092A\u093E\u0930\u094D\u091F\u0940 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u092A\u0902\u091A \u0915\u0930\u0947\u0902, TiffinMate \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0915\u0947 \u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0926\u0947\u0916\u0947\u0902, \u0914\u0930 \u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930-\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u091A\u0915\u094D\u0930 \u0915\u093E \u0935\u0940\u0915\u0932\u0940 \u0938\u0947\u091F\u0932\u092E\u0947\u0902\u091F \u091F\u094D\u0930\u0948\u0915 \u0915\u0930\u0947\u0902\u0964" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap items-center gap-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-slate-300 block font-medium", children: "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0935\u0949\u0932\u0947\u091F \u092C\u0948\u0932\u0947\u0902\u0938" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-2xl font-black text-emerald-400", children: [
                "\u20B9",
                wallet.currentBalance?.toLocaleString() || "5,480"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-[10px] text-amber-300 block font-bold", children: [
                "(\u20B9",
                wallet.minimumReserve,
                " \u0930\u093F\u091C\u093C\u0930\u094D\u0935 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924)"
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              onClick: () => setActiveTab("orders"),
              className: "bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3", children: "\u{1F371}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-base font-black text-slate-900 group-hover:text-emerald-700", children: "\u0932\u093E\u0907\u0935 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0915\u0902\u0938\u094B\u0932" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500 mt-1 font-medium", children: "3P (\u091C\u093C\u094B\u092E\u0948\u091F\u094B/\u0938\u094D\u0935\u0940\u0917\u0940) \u0911\u0930\u094D\u0921\u0930 \u092A\u0902\u091A \u0915\u0930\u0947\u0902 \u0935 TiffinMate \u0915\u0947 \u0911\u091F\u094B-\u0938\u093F\u0902\u0915\u094D\u0921 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0926\u0947\u0916\u0947\u0902\u0964" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-700", children: "\u0915\u0941\u0932 \u0911\u0930\u094D\u0921\u0930\u094D\u0938:" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800", children: orders.length })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              onClick: () => setActiveTab("rate_card"),
              className: "bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3", children: "\u{1F4CB}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-base font-black text-slate-900 group-hover:text-amber-700", children: "\u092A\u094D\u0930\u094B\u0921\u0915\u094D\u091F \u0935 \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500 mt-1 font-medium", children: "PDF \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0905\u0928\u0941\u0938\u093E\u0930 \u0938\u092A\u094D\u0924\u093E\u0939 \u0915\u0947 \u0938\u093E\u0924\u094B\u0902 \u0926\u093F\u0928\u094B\u0902 \u0915\u093E \u092E\u0947\u0928\u0942, \u0925\u093E\u0932\u0940 \u0935 \u0924\u092F \u092D\u0941\u0917\u0924\u093E\u0928 \u0926\u0930\u0947\u0902\u0964" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-700", children: "\u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0906\u0907\u091F\u092E\u094D\u0938:" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800", children: rateCard.length })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              onClick: () => setActiveTab("wallet"),
              className: "bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3", children: "\u{1F4B0}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-base font-black text-slate-900 group-hover:text-teal-700", children: "\u0935\u0949\u0932\u0947\u091F \u0935 \u092C\u0939\u0940\u0916\u093E\u0924\u093E" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500 mt-1 font-medium", children: "\u20B92,000 \u0930\u093F\u091C\u093C\u0930\u094D\u0935, 10-\u0926\u093F\u0928 \u0939\u094B\u0932\u094D\u0921 \u0935 \u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u094B \u0926\u0947\u092F \u092A\u0947\u0906\u0909\u091F \u0915\u093E \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0935\u093F\u0935\u0930\u0923\u0964" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-700", children: "\u0938\u094B\u092E\u0935\u093E\u0930 \u0926\u0947\u092F \u0930\u093E\u0936\u093F:" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800", children: [
                    "\u20B9",
                    wallet.eligibleMondayPayout?.toLocaleString() || "1,630"
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              onClick: () => setActiveTab("inventory"),
              className: "bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3", children: "\u{1F4E6}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-base font-black text-slate-900 group-hover:text-indigo-700", children: "\u0915\u093F\u091A\u0928 \u0907\u0928\u094D\u0935\u0947\u0902\u091F\u0930\u0940 \u0935 \u0938\u094D\u091F\u0949\u0915" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500 mt-1 font-medium", children: "5-\u0915\u0902\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F \u092E\u0940\u0932 \u091F\u094D\u0930\u0947, \u092C\u0949\u0915\u094D\u0938\u0947\u0938, \u0915\u0948\u0930\u0940 \u092C\u0948\u0917 \u0935 \u0915\u091A\u094D\u091A\u093E \u092E\u093E\u0932 \u0938\u094D\u091F\u0949\u0915 \u091F\u094D\u0930\u0948\u0915\u093F\u0902\u0917\u0964" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-700", children: "\u091F\u094D\u0930\u0948\u0915 \u0915\u093F\u090F \u0917\u090F \u0906\u0907\u091F\u092E\u094D\u0938:" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800", children: inventory.length })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-base font-black text-slate-900 flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F525}" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0906\u091C \u0915\u0947 \u0924\u093E\u0924\u094D\u0915\u093E\u0932\u093F\u0915 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 (Live Queue)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "\u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u091F\u093F\u092B\u093F\u0928 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0914\u0930 \u0906\u092A\u0915\u0947 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u0902\u091A \u0915\u093F\u090F \u0917\u090F 3P \u0911\u0930\u094D\u0921\u0930\u094D\u0938\u0964" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                onClick: () => setActiveTab("orders"),
                className: "text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer",
                children: "\u0938\u092D\u0940 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0926\u0947\u0916\u0947\u0902 \u2192"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divide-y divide-slate-100", children: orders.slice(0, 4).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "py-3 flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `px-2 py-1 rounded-lg text-[10px] font-black uppercase ${o.source === "zomato" ? "bg-red-100 text-red-800" : o.source === "swiggy" ? "bg-orange-100 text-orange-800" : o.source === "tiffin_website" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`, children: o.source === "tiffin_website" ? "Tiffin Web" : o.source }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { className: "text-xs font-black text-slate-900", children: [
                  o.itemName,
                  " (x",
                  o.quantity,
                  ")"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-[11px] text-slate-500 font-mono", children: [
                  "#",
                  o.orderNumber,
                  " \u2022 ",
                  o.timeSlot || "Lunch"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-right", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs font-black text-emerald-700 block", children: [
                "+\u20B9",
                o.totalVendorPayout
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${o.status === "delivered" ? "bg-emerald-100 text-emerald-800" : o.status === "ready" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800 animate-pulse"}`, children: o.status })
            ] })
          ] }, o.id)) })
        ] })
      ] }),
      activeTab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-lg font-black text-slate-900 flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F373}" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0932\u093E\u0907\u0935 \u0915\u093F\u091A\u0928 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0935 3P \u0921\u093F\u0938\u094D\u092A\u0948\u091A \u0915\u0902\u0938\u094B\u0932" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "TiffinMate \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0911\u091F\u094B\u092E\u0948\u091F\u093F\u0915 \u0938\u093F\u0902\u0915 \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964 \u091C\u093C\u094B\u092E\u0948\u091F\u094B/\u0938\u094D\u0935\u0940\u0917\u0940 \u0911\u0930\u094D\u0921\u0930\u094D\u0938 1-\u0915\u094D\u0932\u093F\u0915 \u092E\u0947\u0902 \u092A\u0902\u091A \u0915\u0930\u0947\u0902\u0964" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: () => setShowPunchModal(true),
              className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0928\u092F\u093E 3P \u0906\u0930\u094D\u0921\u0930 \u092A\u0902\u091A \u0915\u0930\u0947\u0902" })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap items-center gap-2", children: [
          { id: "all", label: "\u0938\u092D\u0940 \u0911\u0930\u094D\u0921\u0930\u094D\u0938", count: orders.length },
          { id: "tiffin", label: "\u{1F371} TiffinMate \u0911\u091F\u094B-\u0938\u093F\u0902\u0915", count: orders.filter((o) => o.source === "tiffin_website").length },
          { id: "3p", label: "\u{1F6F5} 3P (\u091C\u093C\u094B\u092E\u0948\u091F\u094B / \u0938\u094D\u0935\u0940\u0917\u0940)", count: orders.filter((o) => o.source !== "tiffin_website").length },
          { id: "zomato", label: "Zomato", count: orders.filter((o) => o.source === "zomato").length },
          { id: "swiggy", label: "Swiggy", count: orders.filter((o) => o.source === "swiggy").length }
        ].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            onClick: () => setOrderSourceFilter(tab.id),
            className: `px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${orderSourceFilter === tab.id ? "bg-slate-900 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `text-[10px] px-1.5 py-0.2 rounded-full ${orderSourceFilter === tab.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`, children: tab.count })
            ]
          },
          tab.id
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredOrders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "col-span-2 bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-4xl mb-2", children: "\u{1F37D}\uFE0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-bold text-slate-700", children: "\u0907\u0938 \u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u092E\u0947\u0902 \u0915\u094B\u0908 \u0911\u0930\u094D\u0921\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-400 mt-1", children: '\u0928\u092F\u093E 3P \u0911\u0930\u094D\u0921\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u090A\u092A\u0930 "+ \u0928\u092F\u093E 3P \u0911\u0930\u094D\u0921\u0930" \u092C\u091F\u0928 \u0926\u092C\u093E\u090F\u0902\u0964' })
        ] }) : filteredOrders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${order.source === "zomato" ? "bg-red-100 text-red-800" : order.source === "swiggy" ? "bg-orange-100 text-orange-800" : order.source === "tiffin_website" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"}`, children: order.source === "tiffin_website" ? "TiffinMate Web (Auto-Sync)" : order.source }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs font-mono font-bold text-slate-700", children: [
                      "#",
                      order.orderNumber
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${order.status === "delivered" ? "bg-emerald-100 text-emerald-800" : order.status === "ready" ? "bg-blue-100 text-blue-800" : order.status === "preparing" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-100 text-slate-700"}`, children: order.status === "preparing" ? "\u0915\u093F\u091A\u0928 \u092E\u0947\u0902 \u0924\u0948\u092F\u093E\u0930\u0940 \u{1F373}" : order.status === "ready" ? "\u092A\u0948\u0915 \u0935 \u0924\u0948\u092F\u093E\u0930 \u{1F371}" : order.status === "dispatched" ? "\u0930\u093E\u0907\u0921\u0930 \u0930\u0935\u093E\u0928\u093E \u{1F6F5}" : "\u0921\u093F\u0932\u0940\u0935\u0930 / \u0935\u0949\u0932\u0947\u091F \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0947\u0921 \u2705" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-base font-black text-slate-900", children: order.itemName }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-xs text-slate-500 font-medium", children: [
                    "\u092A\u094B\u0930\u094D\u0936\u0928: ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-slate-800", children: order.portionSize }),
                    " \u2022 \u092E\u093E\u0924\u094D\u0930\u093E: ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { className: "text-slate-800", children: [
                      order.quantity,
                      " Thali/Portion"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0935\u0947\u0902\u0921\u0930 \u0924\u092F \u092D\u0941\u0917\u0924\u093E\u0928 \u0926\u0930" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-black text-slate-800", children: [
                      "\u20B9",
                      order.vendorPayoutRate,
                      " / \u0925\u093E\u0932\u0940"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0915\u0941\u0932 \u0935\u0947\u0902\u0921\u0930 \u0936\u0947\u092F\u0930 (Wallet Credit)" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-black text-emerald-600 text-sm", children: [
                      "\u20B9",
                      order.totalVendorPayout
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u0938\u092E\u092F / \u0938\u094D\u0932\u0949\u091F" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-700", children: order.timeSlot || "Lunch 12:30 PM" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0930\u093E\u0907\u0921\u0930 \u0938\u094D\u0925\u093F\u0924\u093F" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-700", children: order.riderName || "Central Fleet" })
                  ] })
                ] }),
                order.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-[11px] text-slate-600 font-medium bg-amber-50/60 p-2 rounded-lg border border-amber-200/50", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0928\u093F\u0930\u094D\u0926\u0947\u0936:" }),
                  " ",
                  order.notes
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-slate-400", children: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Live" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  order.status === "preparing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => handleStatusChange(order.id, "ready"),
                      className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer",
                      children: "\u092A\u0948\u0915 \u0935 \u0924\u0948\u092F\u093E\u0930 \u092E\u093E\u0930\u094D\u0915 \u0915\u0930\u0947\u0902 \u{1F371}"
                    }
                  ),
                  order.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => handleStatusChange(order.id, "delivered"),
                      className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer",
                      children: "\u0930\u093E\u0907\u0921\u0930 \u0915\u094B \u0938\u094C\u0902\u092A\u093E (\u0921\u093F\u0932\u0940\u0935\u0930) \u{1F6F5}"
                    }
                  ),
                  order.status === "delivered" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs font-bold text-emerald-700 flex items-center gap-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2705" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0947\u0921" })
                  ] })
                ] })
              ] })
            ]
          },
          order.id
        )) })
      ] }),
      activeTab === "rate_card" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs mb-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C4}" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0911\u092B\u093F\u0936\u093F\u092F\u0932 \u0915\u093F\u091A\u0928 \u092E\u0947\u0928\u0942 \u0938\u0947\u091F\u0932\u092E\u0947\u0902\u091F \u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 (PDF Authoritative)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-xl font-black text-slate-900", children: "\u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u092E\u0947\u0928\u0942, \u0925\u093E\u0932\u0940 \u0935 \u0935\u0947\u0902\u0921\u0930 \u092D\u0941\u0917\u0924\u093E\u0928 \u0926\u0930\u0947\u0902" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "\u092F\u0939\u093E\u0901 \u0926\u0940 \u0917\u0908 \u0926\u0930\u0947\u0902 \u0906\u092A\u0915\u0947 \u0914\u0930 TiffinMate \u0915\u0947 \u092C\u0940\u091A \u0939\u0941\u090F \u0905\u0928\u0941\u092C\u0902\u0927 \u0905\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u0939\u0948\u0902 (7-12% \u0932\u0949\u0938 \u092C\u092B\u0930 \u092A\u0949\u0932\u093F\u0938\u0940)\u0964" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "text",
                value: rateSearchQuery,
                onChange: (e) => setRateSearchQuery(e.target.value),
                placeholder: "\u0921\u093F\u0936 \u0916\u094B\u091C\u0947\u0902 (\u091C\u0948\u0938\u0947 \u092A\u0928\u0940\u0930, \u0926\u093E\u0932, \u0925\u093E\u0932\u0940)...",
                className: "px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              }
            ) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100", children: [
            { id: "all", label: "\u0938\u092D\u0940 \u092E\u0947\u0928\u0942" },
            { id: "monday", label: "\u0938\u094B\u092E\u0935\u093E\u0930" },
            { id: "tuesday", label: "\u092E\u0902\u0917\u0932\u0935\u093E\u0930" },
            { id: "wednesday", label: "\u092C\u0941\u0927\u0935\u093E\u0930" },
            { id: "thursday", label: "\u0917\u0941\u0930\u0941\u0935\u093E\u0930" },
            { id: "friday", label: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930" },
            { id: "saturday", label: "\u0936\u0928\u093F\u0935\u093E\u0930" },
            { id: "sunday", label: "\u0930\u0935\u093F\u0935\u093E\u0930" },
            { id: "special_thali", label: "\u0935\u093F\u0936\u0947\u0937 \u0925\u093E\u0932\u0940" },
            { id: "breakfast_snacks", label: "\u0928\u093E\u0936\u094D\u0924\u093E \u0935 \u0938\u094D\u0928\u0948\u0915\u094D\u0938" },
            { id: "vrat_special", label: "\u0935\u094D\u0930\u0924 \u0938\u094D\u092A\u0947\u0936\u0932" },
            { id: "breads_desserts", label: "\u092C\u094D\u0930\u0947\u0921\u094D\u0938, \u091A\u093E\u0935\u0932 \u0935 \u092E\u0940\u0920\u093E" }
          ].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => setRateCategoryFilter(cat.id),
              className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${rateCategoryFilter === cat.id ? "bg-amber-600 text-white shadow-xs font-black" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
              children: cat.label
            },
            cat.id
          )) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredRateCard.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-amber-400 transition-all flex flex-col justify-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60", children: item.categoryLabel }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-base font-black text-slate-900 mt-1", children: item.name }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500 font-medium", children: item.hindiName })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold", children: "\u0909\u092A\u0932\u092C\u094D\u0927 \u{1F7E2}" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-3 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-3 bg-slate-50 p-2 font-black text-[11px] text-slate-600", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0938\u093E\u0907\u091C / \u092A\u094B\u0930\u094D\u0936\u0928" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-center text-slate-400 line-through", children: "Zomato \u0930\u0947\u091F" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-right text-emerald-700", children: "\u0935\u0947\u0902\u0921\u0930 \u092D\u0941\u0917\u0924\u093E\u0928" })
                  ] }),
                  item.portions.map((portion, pIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-3 p-2 font-medium items-center", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-slate-800", children: portion.size }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-center text-slate-400 font-mono text-[11px]", children: [
                      "\u20B9",
                      portion.listingPrice
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-right font-black text-emerald-600 text-sm font-mono", children: [
                      "\u20B9",
                      portion.vendorPayoutRate
                    ] })
                  ] }, pIdx))
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0905\u0928\u0941\u092C\u0902\u0927 \u0926\u0930: \u0932\u0949\u0915 \u{1F512}" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    onClick: () => {
                      setPunchItemId(item.id);
                      setShowPunchModal(true);
                    },
                    className: "text-xs font-black text-amber-600 hover:text-amber-700 cursor-pointer",
                    children: "\u0907\u0938 \u0921\u093F\u0936 \u0915\u093E \u0911\u0930\u094D\u0921\u0930 \u092A\u0902\u091A \u0915\u0930\u0947\u0902 \u2192"
                  }
                )
              ] })
            ]
          },
          item.id || idx
        )) })
      ] }),
      activeTab === "wallet" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 space-y-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950", children: "Vendor Passbook & Settlement Ledger" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-2xl font-black mt-1", children: "\u0935\u0947\u0902\u0921\u0930 \u0921\u093F\u091C\u093F\u091F\u0932 \u0935\u0949\u0932\u0947\u091F" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-300", children: "TiffinMate \u0905\u0927\u093F\u0915\u0943\u0924 \u0905\u0928\u0941\u092C\u0902\u0927: \u0939\u092E\u0947\u0936\u093E \u20B92,000+ \u0930\u093F\u091C\u093C\u0930\u094D\u0935 \u0930\u0939\u0947\u0917\u093E\u0964 \u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930-\u0917\u0941\u0930\u0941\u0935\u093E\u0930 \u091A\u0915\u094D\u0930 \u0915\u093E \u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u0930 \u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u094B \u0939\u094B\u0917\u093E\u0964" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs text-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u092C\u093F\u0932\u093F\u0902\u0917 \u091A\u0915\u094D\u0930: " }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-emerald-300", children: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0938\u0947 \u0917\u0941\u0930\u0941\u0935\u093E\u0930" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-slate-300 block font-medium", children: "\u0915\u0941\u0932 \u0935\u0949\u0932\u0947\u091F \u092C\u0948\u0932\u0947\u0902\u0938" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-2xl font-black text-white mt-1 block", children: [
                "\u20B9",
                wallet.currentBalance?.toLocaleString() || "5,480"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: "\u0924\u0948\u092F\u093E\u0930 \u0935 \u0921\u093F\u0932\u0940\u0935\u0930 \u0911\u0930\u094D\u0921\u0930\u094D\u0938" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-amber-300 block font-medium", children: "\u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0928\u094D\u092F\u0942\u0928\u0924\u092E \u0930\u093F\u091C\u093C\u0930\u094D\u0935" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-2xl font-black text-amber-300 mt-1 block", children: [
                "\u20B9",
                wallet.minimumReserve?.toLocaleString() || "2,000"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: "\u0939\u092E\u0947\u0936\u093E \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-blue-300 block font-medium", children: "10-\u0926\u093F\u0928 \u0930\u094B\u0932\u093F\u0902\u0917 \u0939\u094B\u0932\u094D\u0921" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-2xl font-black text-blue-300 mt-1 block", children: [
                "\u20B9",
                wallet.tenDayHoldAmount?.toLocaleString() || "1,850"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block mt-0.5", children: "DNS / \u0921\u093F\u0938\u094D\u092A\u094D\u092F\u0942\u091F \u0915\u094D\u0932\u0940\u092F\u0930\u0947\u0902\u0938 \u092A\u0930 \u0926\u0947\u092F" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] text-emerald-300 block font-bold", children: "\u0906\u0917\u093E\u092E\u0940 \u0938\u094B\u092E\u0935\u093E\u0930 \u0915\u094B \u0926\u0947\u092F \u092A\u0947\u0906\u0909\u091F" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-2xl font-black text-emerald-400 mt-1 block", children: [
                "\u20B9",
                wallet.eligibleMondayPayout?.toLocaleString() || "1,630"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-emerald-200 block mt-0.5", children: "\u0913\u0928\u0930 \u0938\u093E\u0907\u0921 \u0938\u0947 \u0905\u092A\u094D\u0930\u0942\u0935\u0932 \u0926\u0947\u092F" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-black/30 p-4 rounded-2xl border border-white/10 text-xs space-y-1.5 text-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "font-bold text-amber-400 flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4CC}" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u092A\u0947\u092E\u0947\u0902\u091F \u0928\u093F\u092F\u092E \u0935 \u0938\u092E\u092F-\u0938\u093E\u0930\u093F\u0923\u0940 (Terms of Settlement):" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "1. ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0928\u094D\u092F\u0942\u0928\u0924\u092E \u0930\u093F\u091C\u093C\u0930\u094D\u0935:" }),
              " \u0906\u092A\u0915\u0947 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u0939\u092E\u0947\u0936\u093E \u20B92,000 \u092F\u093E \u0909\u0938\u0938\u0947 \u0905\u0927\u093F\u0915 \u092C\u0948\u0932\u0947\u0902\u0938 \u0930\u0939\u0947\u0917\u093E\u0964"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "2. ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0935\u0940\u0915\u0932\u0940 \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930:" }),
              " \u20B92,000 \u0915\u0947 \u090A\u092A\u0930 \u0915\u093E \u092C\u0948\u0932\u0947\u0902\u0938 \u0939\u0930 \u0939\u092B\u094D\u0924\u0947 ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0938\u094B\u092E\u0935\u093E\u0930 (Monday)" }),
              " \u0915\u094B \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0915\u093F\u092F\u093E \u091C\u093E\u090F\u0917\u093E\u0964"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "3. ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u091A\u0915\u094D\u0930:" }),
              " \u092F\u0939 \u092D\u0941\u0917\u0924\u093E\u0928 ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930 \u0938\u0947 \u0917\u0941\u0930\u0941\u0935\u093E\u0930 (Friday to Thursday)" }),
              " \u0924\u0915 \u0924\u0948\u092F\u093E\u0930 \u0915\u093F\u090F \u0917\u090F \u0911\u0930\u094D\u0921\u0930\u094D\u0938 \u0915\u093E \u0939\u094B\u0924\u093E \u0939\u0948\u0964"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "4. ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "10 \u0926\u093F\u0928 \u0915\u093E \u0939\u094B\u0932\u094D\u0921:" }),
              " 10 \u0926\u093F\u0928 \u0915\u093E \u092D\u0941\u0917\u0924\u093E\u0928 \u0939\u094B\u0932\u094D\u0921 \u092A\u0930 \u0930\u0939\u0947\u0917\u093E, \u091C\u094B DNS (Delivery Non-Service) \u0935 \u0935\u093F\u0935\u093E\u0926 \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0947 \u0938\u092E\u092F \u0930\u093F\u0932\u0940\u091C\u093C \u0915\u093F\u092F\u093E \u091C\u093E\u090F\u0917\u093E\u0964"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "5. ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u0913\u0928\u0930 \u0905\u092A\u094D\u0930\u0942\u0935\u0932:" }),
              " \u092F\u0939 \u092D\u0941\u0917\u0924\u093E\u0928 TiffinMate \u092E\u0941\u0916\u094D\u092F \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0915\u0947 \u0913\u0928\u0930 \u092A\u0948\u0928\u0932 \u0938\u0947 \u0938\u0940\u0927\u0947 \u0906\u092A\u0915\u0947 \u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u0947 / UPI \u092E\u0947\u0902 \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0939\u094B\u0917\u093E\u0964"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-base font-black text-slate-900 flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F9FE}" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0916\u093E\u0924\u093E-\u092C\u0939\u0940 \u0935 \u0932\u0947\u0928-\u0926\u0947\u0928 \u0907\u0924\u093F\u0939\u093E\u0938 (Transactions Passbook)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "\u0911\u0930\u094D\u0921\u0930 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u094D\u0938, \u0935\u0940\u0915\u0932\u0940 \u092A\u0947\u0906\u0909\u091F\u094D\u0938 \u0914\u0930 \u092F\u0942\u091F\u0940\u0906\u0930 \u0928\u0902\u092C\u0930 \u0915\u093E \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u093F\u0935\u0930\u0923\u0964" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                onClick: () => {
                  const txt = `TiffinMate Vendor Ledger
Vendor ID: ${vendorId}
Balance: \u20B9${wallet.currentBalance}
Eligible Monday Payout: \u20B9${wallet.eligibleMondayPayout}
Reserve: \u20B9${wallet.minimumReserve}`;
                  navigator.clipboard.writeText(txt);
                  showToast("\u0932\u0947\u091C\u0930 \u0938\u092E\u0930\u0940 \u0915\u0949\u092A\u0940 \u0939\u094B \u0917\u0908! WhatsApp \u092A\u0930 \u092D\u0947\u091C \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964");
                },
                className: "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer",
                children: "\u0932\u0947\u091C\u0930 \u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902 \u{1F4CB}"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "w-full text-left text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { className: "bg-slate-100 text-slate-700 uppercase font-black", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3 rounded-l-xl", children: "\u0924\u093E\u0930\u0940\u0916" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3", children: "\u0935\u093F\u0935\u0930\u0923 / \u0911\u0930\u094D\u0921\u0930 \u0938\u0902." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3", children: "\u092A\u094D\u0930\u0915\u093E\u0930" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3", children: "\u0930\u093E\u0936\u093F" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3", children: "\u092C\u0948\u0932\u0947\u0902\u0938" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-3 rounded-r-xl", children: "\u0938\u094D\u0925\u093F\u0924\u093F / UTR" })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { className: "divide-y divide-slate-100 font-medium text-slate-700", children: transactions.map((txn) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "hover:bg-slate-50/50", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-3 font-mono text-slate-500", children: txn.date }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { className: "p-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-slate-900 block", children: txn.description }),
                txn.referenceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-[10px] text-slate-400 font-mono", children: [
                  "Ref: ",
                  txn.referenceId
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${txn.type === "order_credit" ? "bg-emerald-100 text-emerald-800" : txn.type === "payout_disbursed" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`, children: txn.type === "order_credit" ? "\u0911\u0930\u094D\u0921\u0930 \u0915\u092E\u093E\u0908" : txn.type === "payout_disbursed" ? "\u092A\u0947\u0906\u0909\u091F \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930" : "\u0939\u094B\u0932\u094D\u0921" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-3 font-black font-mono", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: txn.type === "payout_disbursed" ? "text-red-600" : "text-emerald-600", children: [
                txn.type === "payout_disbursed" ? "-" : "+",
                "\u20B9",
                txn.amount?.toLocaleString()
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { className: "p-3 font-mono font-bold text-slate-800", children: [
                "\u20B9",
                txn.balanceAfter?.toLocaleString()
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { className: "p-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[11px] font-mono text-slate-600 block", children: txn.utrNumber || "Settled via System" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-emerald-700 font-bold", children: txn.ownerApprovedBy ? `\u0913\u0928\u0930 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924` : `\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u2705` })
              ] })
            ] }, txn.id)) })
          ] }) })
        ] })
      ] }),
      activeTab === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-6", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-lg font-black text-slate-900 flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4E6}" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u0915\u093F\u091A\u0928 \u0907\u0928\u094D\u0935\u0947\u0902\u091F\u0930\u0940 \u0935 \u092A\u0948\u0915\u0947\u091C\u093F\u0902\u0917 \u0938\u094D\u091F\u0949\u0915" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "5-\u0915\u0902\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F \u092E\u0940\u0932 \u091F\u094D\u0930\u0947, \u0938\u092C\u094D\u091C\u0940 \u092C\u0949\u0915\u094D\u0938\u0947\u0938, \u0915\u0948\u0930\u0940 \u092C\u0948\u0917 \u0935 \u0915\u091A\u094D\u091A\u093E \u092E\u093E\u0932 \u0915\u093E \u0930\u0940\u092F\u0932-\u091F\u093E\u0907\u092E \u092C\u0948\u0932\u0947\u0902\u0938\u0964" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => {
                showToast("\u0907\u0902\u0921\u0947\u0902\u091F \u0930\u093F\u0915\u094D\u0935\u0947\u0938\u094D\u091F TiffinMate \u0938\u0947\u0902\u091F\u094D\u0930\u0932 \u0938\u094D\u091F\u094B\u0930 \u0915\u094B \u092D\u0947\u091C \u0926\u0940 \u0917\u0908 \u0939\u0948!");
              },
              className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer",
              children: "+ \u0928\u092F\u093E \u0938\u093E\u092E\u093E\u0928 \u0907\u0902\u0921\u0947\u0902\u091F \u092D\u0947\u091C\u0947\u0902"
            }
          ) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2", children: inventory.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: "p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/50", children: item.category === "packaging" ? "\u092A\u0948\u0915\u0947\u091C\u093F\u0902\u0917 \u091F\u094D\u0930\u0947/\u0921\u093F\u092C\u094D\u092C\u093E" : "\u0915\u091A\u094D\u091A\u093E \u0930\u093E\u0936\u0928" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "text-sm font-black text-slate-900 mt-1", children: item.name }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: item.hindiName })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${item.status === "sufficient" ? "bg-emerald-100 text-emerald-800" : item.status === "low" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800 animate-pulse"}`, children: item.status })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-3 p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0909\u092A\u0932\u092C\u094D\u0927 \u0938\u094D\u091F\u0949\u0915" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xl font-black text-slate-900 font-mono", children: [
                      item.currentStock,
                      " ",
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-slate-500 font-normal", children: item.unit })
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "button",
                      {
                        onClick: () => handleInventoryAdjust(item.id, -10),
                        className: "w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer",
                        title: "10 \u0918\u091F\u093E\u090F\u0902",
                        children: "-"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "button",
                      {
                        onClick: () => handleInventoryAdjust(item.id, 10),
                        className: "w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-sm flex items-center justify-center cursor-pointer",
                        title: "10 \u091C\u094B\u0921\u093C\u0947\u0902",
                        children: "+"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-[10px] text-slate-400 font-mono", children: [
                "\u0928\u094D\u092F\u0942\u0928\u0924\u092E \u0938\u0940\u092E\u093E: ",
                item.minThreshold,
                " ",
                item.unit
              ] })
            ]
          },
          item.id
        )) })
      ] }) }),
      activeTab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-6", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-black border border-emerald-300", children: "\u{1F3EA}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950", children: "Verified Kitchen Partner" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs font-mono font-bold text-slate-500", children: [
                "ID: ",
                vendorId
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-xl font-black text-slate-900 mt-0.5", children: vendorName }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "TiffinMate Cloud Kitchen Production Unit" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0935\u0947\u0902\u0921\u0930 \u092F\u0942\u091C\u093C\u0930 ID" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-black font-mono text-slate-900", children: "NIR8800" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0930\u091C\u093F\u0938\u094D\u091F\u0930\u094D\u0921 \u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-black font-mono text-slate-900", children: "+91 9118409672" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "GSTIN \u0928\u0902\u092C\u0930" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-black font-mono text-slate-900", children: "07AAACN8800F1ZV" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u092A\u0947\u0906\u0909\u091F UPI ID" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-black font-mono text-emerald-600", children: "nir8800@upi" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u093E \u0938\u0902\u0916\u094D\u092F\u093E" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-black font-mono text-slate-900", children: "919118409672 (PYTM0123456)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-slate-400 block font-semibold", children: "\u0911\u092A\u0930\u0947\u091F\u093F\u0902\u0917 \u0938\u092E\u092F" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs font-bold text-slate-800", children: "\u0938\u0941\u092C\u0939 7:00 AM \u0938\u0947 \u0930\u093E\u0924 11:00 PM" })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg py-2 px-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "max-w-md mx-auto flex items-center justify-between", children: [
      { id: "home", label: "\u0939\u094B\u092E", icon: "\u{1F3E0}" },
      { id: "orders", label: "\u0911\u0930\u094D\u0921\u0930\u094D\u0938", icon: "\u{1F371}", badge: orders.length },
      { id: "rate_card", label: "\u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921", icon: "\u{1F4CB}" },
      { id: "wallet", label: "\u0935\u0949\u0932\u0947\u091F", icon: "\u{1F4B0}" },
      { id: "inventory", label: "\u0907\u0928\u094D\u0935\u0947\u0902\u091F\u0930\u0940", icon: "\u{1F4E6}" }
    ].map((nav) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        onClick: () => setActiveTab(nav.id),
        className: `flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer relative ${activeTab === nav.id ? "text-emerald-700 font-black" : "text-slate-500 hover:text-slate-900 font-medium"}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-lg relative", children: [
            nav.icon,
            nav.badge !== void 0 && nav.badge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full", children: nav.badge })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] tracking-tight mt-0.5", children: nav.label })
        ]
      },
      nav.id
    )) }) }),
    showPunchModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-fade-in", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between border-b border-slate-100 pb-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-lg font-black text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F6F5}" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3P \u0911\u0930\u094D\u0921\u0930 \u092A\u0902\u091A \u0915\u0930\u0947\u0902 (Zomato / Swiggy)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-slate-500", children: "\u0911\u0930\u094D\u0921\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0924\u0947 \u0939\u0940 \u0915\u093F\u091A\u0928 \u092E\u0947\u0902 \u0938\u0942\u091A\u0928\u093E \u091C\u093E\u090F\u0917\u0940 \u0914\u0930 \u0921\u093F\u0932\u0940\u0935\u0930 \u0939\u094B\u0928\u0947 \u092A\u0930 \u0924\u092F \u0930\u093E\u0936\u093F \u0906\u092A\u0915\u0947 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u091C\u0941\u0921\u093C\u0947\u0917\u0940\u0964" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => setShowPunchModal(false),
            className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", { onSubmit: handlePunchSubmit, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "font-bold text-slate-700 block mb-1", children: "1. \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u091A\u0941\u0928\u0947\u0902:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-4 gap-2", children: [
            { id: "zomato", label: "Zomato", color: "bg-red-50 text-red-700 border-red-300" },
            { id: "swiggy", label: "Swiggy", color: "bg-orange-50 text-orange-700 border-orange-300" },
            { id: "magicpin", label: "Magicpin", color: "bg-blue-50 text-blue-700 border-blue-300" },
            { id: "direct", label: "Direct", color: "bg-emerald-50 text-emerald-700 border-emerald-300" }
          ].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setPunchSource(p.id),
              className: `py-2 rounded-xl border text-xs font-black cursor-pointer transition-all ${punchSource === p.id ? `${p.color} ring-2 ring-emerald-500` : "bg-slate-50 text-slate-600 border-slate-200"}`,
              children: p.label
            },
            p.id
          )) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "font-bold text-slate-700 block mb-1", children: "2. \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u0911\u0930\u094D\u0921\u0930 ID (Zomato / Swiggy Order #):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "text",
              required: true,
              value: punchOrderId,
              onChange: (e) => setPunchOrderId(e.target.value),
              placeholder: "\u0909\u0926\u093E. #ZOM-99214 \u092F\u093E 98402",
              className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "font-bold text-slate-700 block mb-1", children: "3. \u0921\u093F\u0936 \u091A\u0941\u0928\u0947\u0902 (\u0930\u0947\u091F \u0915\u093E\u0930\u094D\u0921 \u0905\u0928\u0941\u0938\u093E\u0930):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "select",
            {
              value: punchItemId,
              onChange: (e) => {
                setPunchItemId(e.target.value);
                const itm = rateCard.find((i) => i.id === e.target.value);
                if (itm && itm.portions[0]) {
                  setPunchPortionSize(itm.portions[0].size);
                }
              },
              className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500",
              children: rateCard.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: item.id, children: [
                item.name,
                " (",
                item.hindiName,
                ") - ",
                item.categoryLabel
              ] }, item.id))
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "font-bold text-slate-700 block mb-1", children: "\u092A\u094B\u0930\u094D\u0936\u0928 \u0938\u093E\u0907\u091C:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "select",
              {
                value: punchPortionSize,
                onChange: (e) => setPunchPortionSize(e.target.value),
                className: "w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900",
                children: selectedRateItem?.portions.map((p, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: p.size, children: [
                  p.size,
                  " (\u092D\u0941\u0917\u0924\u093E\u0928: \u20B9",
                  p.vendorPayoutRate,
                  ")"
                ] }, idx))
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "font-bold text-slate-700 block mb-1", children: "\u092E\u093E\u0924\u094D\u0930\u093E (Quantity):" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => setPunchQuantity((q) => Math.max(1, q - 1)),
                  className: "w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black",
                  children: "-"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-black text-base w-8 text-center", children: punchQuantity }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => setPunchQuantity((q) => q + 1),
                  className: "w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black",
                  children: "+"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-emerald-800 block font-semibold", children: "\u0924\u092F \u0935\u0947\u0902\u0921\u0930 \u092D\u0941\u0917\u0924\u093E\u0928 \u0926\u0930:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-bold text-slate-700", children: [
              "\u20B9",
              selectedRateItem?.portions.find((p) => p.size === punchPortionSize)?.vendorPayoutRate || 80,
              " \xD7 ",
              punchQuantity
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-right", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-emerald-800 block font-semibold", children: "\u0921\u093F\u0932\u0940\u0935\u0930\u0940 \u092A\u0930 \u0935\u0949\u0932\u0947\u091F \u092E\u0947\u0902 \u091C\u0941\u0921\u093C\u0947\u0917\u093E:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-lg font-black text-emerald-700", children: [
              "\u20B9",
              (selectedRateItem?.portions.find((p) => p.size === punchPortionSize)?.vendorPayoutRate || 80) * punchQuantity
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "font-bold text-slate-700 block mb-1", children: "\u0935\u093F\u0936\u0947\u0937 \u0928\u093F\u0930\u094D\u0926\u0947\u0936 (Optional):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "text",
              value: punchNotes,
              onChange: (e) => setPunchNotes(e.target.value),
              placeholder: "\u0909\u0926\u093E. \u0915\u092E \u0924\u0947\u0932, \u090F\u0915\u094D\u0938\u094D\u091F\u094D\u0930\u093E \u0938\u0932\u093E\u0926, \u0930\u093E\u0907\u0921\u0930 10 \u092E\u093F\u0928\u091F \u092E\u0947\u0902 \u092A\u0939\u0941\u0902\u091A\u0947\u0917\u093E",
              className: "w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pt-2 flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setShowPunchModal(false),
              className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer",
              children: "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "submit",
              className: "px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer active:scale-95 transition-all",
              children: "\u0911\u0930\u094D\u0921\u0930 \u0915\u093F\u091A\u0928 \u092E\u0947\u0902 \u092D\u0947\u091C\u0947\u0902 \u{1F373}"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  VendorPortalApp
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
