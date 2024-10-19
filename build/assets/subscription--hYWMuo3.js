import { r as reactExports, j as jsxRuntimeExports, R as React, $ as $2AODx$react } from "./jsx-runtime-IZdvEyt_.js";
import { A as ArrowLeftIcon, e as ArrowRightIcon } from "./index-DiXcXsr5.js";
import { c as cn$1, B as Button, u as useComposedRefs, e as Slottable, d as buttonVariants } from "./button-CzfLTIHt.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardFooter } from "./card-AoQj0I9n.js";
import { c as createContextScope, b as composeEventHandlers } from "./index-C-2rzX6a.js";
import { d as createDialogScope, b as Trigger, O as Overlay, W as WarningProvider, C as Content, T as Title, D as Description, a as Close, R as Root, P as Portal } from "./index-DUTfRgmH.js";
import { S as Skeleton } from "./skeleton-DwNK_yGs.js";
import { f as filesize } from "./filesize-DaDW_CYa.js";
import { a as useApiUrl, u as useSubscription, b as useIsPaidBillingEnabled } from "./useSubscription-BJBkiziB.js";
import { a as ii, c as $e$1, p as pi, z as zt } from "./index-DU1IfKY5.js";
import { u as usePluginMeta } from "./usePluginMeta-BNkMCdOH.js";
import { a as FormField, b as FormItem, e as FormLabel, c as FormControl, d as FormMessage, u as useForm, F as Form } from "./form-D1HtfKzz.js";
import { t } from "./zod-DADFYJkp.js";
import { I as Input } from "./input-B6UnxZyR.js";
import { T as Textarea } from "./textarea-C63kCrGx.js";
import { z as z$1 } from "./index-BpxO7BrF.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Dc2H5Ola.js";
import { r as reactDomExports, $ as $7SXl2$reactdom } from "./index-BquAYmyk.js";
import { c as createLucideIcon, d as createSidecarMedium, _ as __rest, e as useMergeRefs, f as __assign, g as fullWidthClassName, z as zeroRightClassName, s as styleSingleton, i as __spreadArray, j as RemoveScrollBar, k as exportSidecar, h as hideOthers } from "./Combination-BC6FEbU4.js";
import "./dialog-D6SmLySg.js";
import { S as Search } from "./search-ChO2Fdmu.js";
import { C as Check } from "./check-DZlwGSeQ.js";
import "./useFeatureFlag-PPzt5-ch.js";
import "./usePortalMeta-BrKLDHxF.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./label-DPLqB6Bj.js";
import "./index-CXs_k2So.js";
import "./index-B2actZrY.js";
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronsUpDown = createLucideIcon("ChevronsUpDown", [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
]);
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t2 = arguments[e];
      for (var r in t2) ({}).hasOwnProperty.call(t2, r) && (n[r] = t2[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function isObject$1(subject) {
  return Object.prototype.toString.call(subject) === "[object Object]";
}
function isRecord(subject) {
  return isObject$1(subject) || Array.isArray(subject);
}
function canUseDOM() {
  return !!(typeof window !== "undefined" && window.document && window.document.createElement);
}
function areOptionsEqual(optionsA, optionsB) {
  const optionsAKeys = Object.keys(optionsA);
  const optionsBKeys = Object.keys(optionsB);
  if (optionsAKeys.length !== optionsBKeys.length) return false;
  const breakpointsA = JSON.stringify(Object.keys(optionsA.breakpoints || {}));
  const breakpointsB = JSON.stringify(Object.keys(optionsB.breakpoints || {}));
  if (breakpointsA !== breakpointsB) return false;
  return optionsAKeys.every((key) => {
    const valueA = optionsA[key];
    const valueB = optionsB[key];
    if (typeof valueA === "function") return `${valueA}` === `${valueB}`;
    if (!isRecord(valueA) || !isRecord(valueB)) return valueA === valueB;
    return areOptionsEqual(valueA, valueB);
  });
}
function sortAndMapPluginToOptions(plugins) {
  return plugins.concat().sort((a2, b2) => a2.name > b2.name ? 1 : -1).map((plugin) => plugin.options);
}
function arePluginsEqual(pluginsA, pluginsB) {
  if (pluginsA.length !== pluginsB.length) return false;
  const optionsA = sortAndMapPluginToOptions(pluginsA);
  const optionsB = sortAndMapPluginToOptions(pluginsB);
  return optionsA.every((optionA, index) => {
    const optionB = optionsB[index];
    return areOptionsEqual(optionA, optionB);
  });
}
function isNumber(subject) {
  return typeof subject === "number";
}
function isString(subject) {
  return typeof subject === "string";
}
function isBoolean(subject) {
  return typeof subject === "boolean";
}
function isObject(subject) {
  return Object.prototype.toString.call(subject) === "[object Object]";
}
function mathAbs(n) {
  return Math.abs(n);
}
function mathSign(n) {
  return Math.sign(n);
}
function deltaAbs(valueB, valueA) {
  return mathAbs(valueB - valueA);
}
function factorAbs(valueB, valueA) {
  if (valueB === 0 || valueA === 0) return 0;
  if (mathAbs(valueB) <= mathAbs(valueA)) return 0;
  const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA));
  return mathAbs(diff / valueB);
}
function arrayKeys(array) {
  return objectKeys(array).map(Number);
}
function arrayLast(array) {
  return array[arrayLastIndex(array)];
}
function arrayLastIndex(array) {
  return Math.max(0, array.length - 1);
}
function arrayIsLastIndex(array, index) {
  return index === arrayLastIndex(array);
}
function arrayFromNumber(n, startAt = 0) {
  return Array.from(Array(n), (_2, i) => startAt + i);
}
function objectKeys(object) {
  return Object.keys(object);
}
function objectsMergeDeep(objectA, objectB) {
  return [objectA, objectB].reduce((mergedObjects, currentObject) => {
    objectKeys(currentObject).forEach((key) => {
      const valueA = mergedObjects[key];
      const valueB = currentObject[key];
      const areObjects = isObject(valueA) && isObject(valueB);
      mergedObjects[key] = areObjects ? objectsMergeDeep(valueA, valueB) : valueB;
    });
    return mergedObjects;
  }, {});
}
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}
function Alignment(align, viewSize) {
  const predefined = {
    start,
    center,
    end
  };
  function start() {
    return 0;
  }
  function center(n) {
    return end(n) / 2;
  }
  function end(n) {
    return viewSize - n;
  }
  function measure(n, index) {
    if (isString(align)) return predefined[align](n);
    return align(viewSize, n, index);
  }
  const self = {
    measure
  };
  return self;
}
function EventStore() {
  let listeners = [];
  function add(node, type, handler, options = {
    passive: true
  }) {
    let removeListener;
    if ("addEventListener" in node) {
      node.addEventListener(type, handler, options);
      removeListener = () => node.removeEventListener(type, handler, options);
    } else {
      const legacyMediaQueryList = node;
      legacyMediaQueryList.addListener(handler);
      removeListener = () => legacyMediaQueryList.removeListener(handler);
    }
    listeners.push(removeListener);
    return self;
  }
  function clear() {
    listeners = listeners.filter((remove) => remove());
  }
  const self = {
    add,
    clear
  };
  return self;
}
function Animations(ownerDocument, ownerWindow, update, render) {
  const documentVisibleHandler = EventStore();
  const timeStep = 1e3 / 60;
  let lastTimeStamp = null;
  let lag = 0;
  let animationFrame = 0;
  function init() {
    documentVisibleHandler.add(ownerDocument, "visibilitychange", () => {
      if (ownerDocument.hidden) reset();
    });
  }
  function destroy() {
    stop();
    documentVisibleHandler.clear();
  }
  function animate(timeStamp) {
    if (!animationFrame) return;
    if (!lastTimeStamp) lastTimeStamp = timeStamp;
    const elapsed = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    lag += elapsed;
    while (lag >= timeStep) {
      update(timeStep);
      lag -= timeStep;
    }
    const lagOffset = lag / timeStep;
    render(lagOffset);
    if (animationFrame) ownerWindow.requestAnimationFrame(animate);
  }
  function start() {
    if (animationFrame) return;
    animationFrame = ownerWindow.requestAnimationFrame(animate);
  }
  function stop() {
    ownerWindow.cancelAnimationFrame(animationFrame);
    lastTimeStamp = null;
    lag = 0;
    animationFrame = 0;
  }
  function reset() {
    lastTimeStamp = null;
    lag = 0;
  }
  const self = {
    init,
    destroy,
    start,
    stop,
    update: () => update(timeStep),
    render
  };
  return self;
}
function Axis(axis, contentDirection) {
  const isRightToLeft = contentDirection === "rtl";
  const isVertical = axis === "y";
  const scroll = isVertical ? "y" : "x";
  const cross = isVertical ? "x" : "y";
  const sign = !isVertical && isRightToLeft ? -1 : 1;
  const startEdge = getStartEdge();
  const endEdge = getEndEdge();
  function measureSize(nodeRect) {
    const {
      height,
      width
    } = nodeRect;
    return isVertical ? height : width;
  }
  function getStartEdge() {
    if (isVertical) return "top";
    return isRightToLeft ? "right" : "left";
  }
  function getEndEdge() {
    if (isVertical) return "bottom";
    return isRightToLeft ? "left" : "right";
  }
  function direction(n) {
    return n * sign;
  }
  const self = {
    scroll,
    cross,
    startEdge,
    endEdge,
    measureSize,
    direction
  };
  return self;
}
function Limit(min = 0, max = 0) {
  const length = mathAbs(min - max);
  function reachedMin(n) {
    return n < min;
  }
  function reachedMax(n) {
    return n > max;
  }
  function reachedAny(n) {
    return reachedMin(n) || reachedMax(n);
  }
  function constrain(n) {
    if (!reachedAny(n)) return n;
    return reachedMin(n) ? min : max;
  }
  function removeOffset(n) {
    if (!length) return n;
    return n - length * Math.ceil((n - max) / length);
  }
  const self = {
    length,
    max,
    min,
    constrain,
    reachedAny,
    reachedMax,
    reachedMin,
    removeOffset
  };
  return self;
}
function Counter(max, start, loop) {
  const {
    constrain
  } = Limit(0, max);
  const loopEnd = max + 1;
  let counter = withinLimit(start);
  function withinLimit(n) {
    return !loop ? constrain(n) : mathAbs((loopEnd + n) % loopEnd);
  }
  function get() {
    return counter;
  }
  function set(n) {
    counter = withinLimit(n);
    return self;
  }
  function add(n) {
    return clone().set(get() + n);
  }
  function clone() {
    return Counter(max, get(), loop);
  }
  const self = {
    get,
    set,
    add,
    clone
  };
  return self;
}
function DragHandler(axis, rootNode, ownerDocument, ownerWindow, target, dragTracker, location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, baseFriction, watchDrag) {
  const {
    cross: crossAxis,
    direction
  } = axis;
  const focusNodes = ["INPUT", "SELECT", "TEXTAREA"];
  const nonPassiveEvent = {
    passive: false
  };
  const initEvents = EventStore();
  const dragEvents = EventStore();
  const goToNextThreshold = Limit(50, 225).constrain(percentOfView.measure(20));
  const snapForceBoost = {
    mouse: 300,
    touch: 400
  };
  const freeForceBoost = {
    mouse: 500,
    touch: 600
  };
  const baseSpeed = dragFree ? 43 : 25;
  let isMoving = false;
  let startScroll = 0;
  let startCross = 0;
  let pointerIsDown = false;
  let preventScroll = false;
  let preventClick = false;
  let isMouse = false;
  function init(emblaApi) {
    if (!watchDrag) return;
    function downIfAllowed(evt) {
      if (isBoolean(watchDrag) || watchDrag(emblaApi, evt)) down(evt);
    }
    const node = rootNode;
    initEvents.add(node, "dragstart", (evt) => evt.preventDefault(), nonPassiveEvent).add(node, "touchmove", () => void 0, nonPassiveEvent).add(node, "touchend", () => void 0).add(node, "touchstart", downIfAllowed).add(node, "mousedown", downIfAllowed).add(node, "touchcancel", up).add(node, "contextmenu", up).add(node, "click", click, true);
  }
  function destroy() {
    initEvents.clear();
    dragEvents.clear();
  }
  function addDragEvents() {
    const node = isMouse ? ownerDocument : rootNode;
    dragEvents.add(node, "touchmove", move, nonPassiveEvent).add(node, "touchend", up).add(node, "mousemove", move, nonPassiveEvent).add(node, "mouseup", up);
  }
  function isFocusNode(node) {
    const nodeName = node.nodeName || "";
    return focusNodes.includes(nodeName);
  }
  function forceBoost() {
    const boost = dragFree ? freeForceBoost : snapForceBoost;
    const type = isMouse ? "mouse" : "touch";
    return boost[type];
  }
  function allowedForce(force, targetChanged) {
    const next = index.add(mathSign(force) * -1);
    const baseForce = scrollTarget.byDistance(force, !dragFree).distance;
    if (dragFree || mathAbs(force) < goToNextThreshold) return baseForce;
    if (skipSnaps && targetChanged) return baseForce * 0.5;
    return scrollTarget.byIndex(next.get(), 0).distance;
  }
  function down(evt) {
    const isMouseEvt = isMouseEvent(evt, ownerWindow);
    isMouse = isMouseEvt;
    preventClick = dragFree && isMouseEvt && !evt.buttons && isMoving;
    isMoving = deltaAbs(target.get(), location.get()) >= 2;
    if (isMouseEvt && evt.button !== 0) return;
    if (isFocusNode(evt.target)) return;
    pointerIsDown = true;
    dragTracker.pointerDown(evt);
    scrollBody.useFriction(0).useDuration(0);
    target.set(location);
    addDragEvents();
    startScroll = dragTracker.readPoint(evt);
    startCross = dragTracker.readPoint(evt, crossAxis);
    eventHandler.emit("pointerDown");
  }
  function move(evt) {
    const isTouchEvt = !isMouseEvent(evt, ownerWindow);
    if (isTouchEvt && evt.touches.length >= 2) return up(evt);
    const lastScroll = dragTracker.readPoint(evt);
    const lastCross = dragTracker.readPoint(evt, crossAxis);
    const diffScroll = deltaAbs(lastScroll, startScroll);
    const diffCross = deltaAbs(lastCross, startCross);
    if (!preventScroll && !isMouse) {
      if (!evt.cancelable) return up(evt);
      preventScroll = diffScroll > diffCross;
      if (!preventScroll) return up(evt);
    }
    const diff = dragTracker.pointerMove(evt);
    if (diffScroll > dragThreshold) preventClick = true;
    scrollBody.useFriction(0.3).useDuration(0.75);
    animation.start();
    target.add(direction(diff));
    evt.preventDefault();
  }
  function up(evt) {
    const currentLocation = scrollTarget.byDistance(0, false);
    const targetChanged = currentLocation.index !== index.get();
    const rawForce = dragTracker.pointerUp(evt) * forceBoost();
    const force = allowedForce(direction(rawForce), targetChanged);
    const forceFactor = factorAbs(rawForce, force);
    const speed = baseSpeed - 10 * forceFactor;
    const friction = baseFriction + forceFactor / 50;
    preventScroll = false;
    pointerIsDown = false;
    dragEvents.clear();
    scrollBody.useDuration(speed).useFriction(friction);
    scrollTo.distance(force, !dragFree);
    isMouse = false;
    eventHandler.emit("pointerUp");
  }
  function click(evt) {
    if (preventClick) {
      evt.stopPropagation();
      evt.preventDefault();
      preventClick = false;
    }
  }
  function pointerDown() {
    return pointerIsDown;
  }
  const self = {
    init,
    destroy,
    pointerDown
  };
  return self;
}
function DragTracker(axis, ownerWindow) {
  const logInterval = 170;
  let startEvent;
  let lastEvent;
  function readTime(evt) {
    return evt.timeStamp;
  }
  function readPoint(evt, evtAxis) {
    const property = evtAxis || axis.scroll;
    const coord = `client${property === "x" ? "X" : "Y"}`;
    return (isMouseEvent(evt, ownerWindow) ? evt : evt.touches[0])[coord];
  }
  function pointerDown(evt) {
    startEvent = evt;
    lastEvent = evt;
    return readPoint(evt);
  }
  function pointerMove(evt) {
    const diff = readPoint(evt) - readPoint(lastEvent);
    const expired = readTime(evt) - readTime(startEvent) > logInterval;
    lastEvent = evt;
    if (expired) startEvent = evt;
    return diff;
  }
  function pointerUp(evt) {
    if (!startEvent || !lastEvent) return 0;
    const diffDrag = readPoint(lastEvent) - readPoint(startEvent);
    const diffTime = readTime(evt) - readTime(startEvent);
    const expired = readTime(evt) - readTime(lastEvent) > logInterval;
    const force = diffDrag / diffTime;
    const isFlick = diffTime && !expired && mathAbs(force) > 0.1;
    return isFlick ? force : 0;
  }
  const self = {
    pointerDown,
    pointerMove,
    pointerUp,
    readPoint
  };
  return self;
}
function NodeRects() {
  function measure(node) {
    const {
      offsetTop,
      offsetLeft,
      offsetWidth,
      offsetHeight
    } = node;
    const offset = {
      top: offsetTop,
      right: offsetLeft + offsetWidth,
      bottom: offsetTop + offsetHeight,
      left: offsetLeft,
      width: offsetWidth,
      height: offsetHeight
    };
    return offset;
  }
  const self = {
    measure
  };
  return self;
}
function PercentOfView(viewSize) {
  function measure(n) {
    return viewSize * (n / 100);
  }
  const self = {
    measure
  };
  return self;
}
function ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects) {
  const observeNodes = [container].concat(slides);
  let resizeObserver;
  let containerSize;
  let slideSizes = [];
  let destroyed = false;
  function readSize(node) {
    return axis.measureSize(nodeRects.measure(node));
  }
  function init(emblaApi) {
    if (!watchResize) return;
    containerSize = readSize(container);
    slideSizes = slides.map(readSize);
    function defaultCallback(entries) {
      for (const entry of entries) {
        if (destroyed) return;
        const isContainer = entry.target === container;
        const slideIndex = slides.indexOf(entry.target);
        const lastSize = isContainer ? containerSize : slideSizes[slideIndex];
        const newSize = readSize(isContainer ? container : slides[slideIndex]);
        const diffSize = mathAbs(newSize - lastSize);
        if (diffSize >= 0.5) {
          emblaApi.reInit();
          eventHandler.emit("resize");
          break;
        }
      }
    }
    resizeObserver = new ResizeObserver((entries) => {
      if (isBoolean(watchResize) || watchResize(emblaApi, entries)) {
        defaultCallback(entries);
      }
    });
    ownerWindow.requestAnimationFrame(() => {
      observeNodes.forEach((node) => resizeObserver.observe(node));
    });
  }
  function destroy() {
    destroyed = true;
    if (resizeObserver) resizeObserver.disconnect();
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function ScrollBody(location, offsetLocation, previousLocation, target, baseDuration, baseFriction) {
  let bodyVelocity = 0;
  let scrollDirection = 0;
  let scrollDuration = baseDuration;
  let scrollFriction = baseFriction;
  let rawLocation = location.get();
  let rawLocationPrevious = 0;
  function seek(timeStep) {
    const fixedDeltaTimeSeconds = timeStep / 1e3;
    const duration2 = scrollDuration * fixedDeltaTimeSeconds;
    const diff = target.get() - location.get();
    const isInstant = !scrollDuration;
    let directionDiff = 0;
    if (isInstant) {
      bodyVelocity = 0;
      previousLocation.set(target);
      location.set(target);
      directionDiff = diff;
    } else {
      previousLocation.set(location);
      bodyVelocity += diff / duration2;
      bodyVelocity *= scrollFriction;
      rawLocation += bodyVelocity;
      location.add(bodyVelocity * fixedDeltaTimeSeconds);
      directionDiff = rawLocation - rawLocationPrevious;
    }
    scrollDirection = mathSign(directionDiff);
    rawLocationPrevious = rawLocation;
    return self;
  }
  function settled() {
    const diff = target.get() - offsetLocation.get();
    return mathAbs(diff) < 1e-3;
  }
  function duration() {
    return scrollDuration;
  }
  function direction() {
    return scrollDirection;
  }
  function velocity() {
    return bodyVelocity;
  }
  function useBaseDuration() {
    return useDuration(baseDuration);
  }
  function useBaseFriction() {
    return useFriction(baseFriction);
  }
  function useDuration(n) {
    scrollDuration = n;
    return self;
  }
  function useFriction(n) {
    scrollFriction = n;
    return self;
  }
  const self = {
    direction,
    duration,
    velocity,
    seek,
    settled,
    useBaseFriction,
    useBaseDuration,
    useFriction,
    useDuration
  };
  return self;
}
function ScrollBounds(limit, location, target, scrollBody, percentOfView) {
  const pullBackThreshold = percentOfView.measure(10);
  const edgeOffsetTolerance = percentOfView.measure(50);
  const frictionLimit = Limit(0.1, 0.99);
  let disabled = false;
  function shouldConstrain() {
    if (disabled) return false;
    if (!limit.reachedAny(target.get())) return false;
    if (!limit.reachedAny(location.get())) return false;
    return true;
  }
  function constrain(pointerDown) {
    if (!shouldConstrain()) return;
    const edge = limit.reachedMin(location.get()) ? "min" : "max";
    const diffToEdge = mathAbs(limit[edge] - location.get());
    const diffToTarget = target.get() - location.get();
    const friction = frictionLimit.constrain(diffToEdge / edgeOffsetTolerance);
    target.subtract(diffToTarget * friction);
    if (!pointerDown && mathAbs(diffToTarget) < pullBackThreshold) {
      target.set(limit.constrain(target.get()));
      scrollBody.useDuration(25).useBaseFriction();
    }
  }
  function toggleActive(active) {
    disabled = !active;
  }
  const self = {
    shouldConstrain,
    constrain,
    toggleActive
  };
  return self;
}
function ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance) {
  const scrollBounds = Limit(-contentSize + viewSize, 0);
  const snapsBounded = measureBounded();
  const scrollContainLimit = findScrollContainLimit();
  const snapsContained = measureContained();
  function usePixelTolerance(bound, snap) {
    return deltaAbs(bound, snap) < 1;
  }
  function findScrollContainLimit() {
    const startSnap = snapsBounded[0];
    const endSnap = arrayLast(snapsBounded);
    const min = snapsBounded.lastIndexOf(startSnap);
    const max = snapsBounded.indexOf(endSnap) + 1;
    return Limit(min, max);
  }
  function measureBounded() {
    return snapsAligned.map((snapAligned, index) => {
      const {
        min,
        max
      } = scrollBounds;
      const snap = scrollBounds.constrain(snapAligned);
      const isFirst = !index;
      const isLast = arrayIsLastIndex(snapsAligned, index);
      if (isFirst) return max;
      if (isLast) return min;
      if (usePixelTolerance(min, snap)) return min;
      if (usePixelTolerance(max, snap)) return max;
      return snap;
    }).map((scrollBound) => parseFloat(scrollBound.toFixed(3)));
  }
  function measureContained() {
    if (contentSize <= viewSize + pixelTolerance) return [scrollBounds.max];
    if (containScroll === "keepSnaps") return snapsBounded;
    const {
      min,
      max
    } = scrollContainLimit;
    return snapsBounded.slice(min, max);
  }
  const self = {
    snapsContained,
    scrollContainLimit
  };
  return self;
}
function ScrollLimit(contentSize, scrollSnaps, loop) {
  const max = scrollSnaps[0];
  const min = loop ? max - contentSize : arrayLast(scrollSnaps);
  const limit = Limit(min, max);
  const self = {
    limit
  };
  return self;
}
function ScrollLooper(contentSize, limit, location, vectors) {
  const jointSafety = 0.1;
  const min = limit.min + jointSafety;
  const max = limit.max + jointSafety;
  const {
    reachedMin,
    reachedMax
  } = Limit(min, max);
  function shouldLoop(direction) {
    if (direction === 1) return reachedMax(location.get());
    if (direction === -1) return reachedMin(location.get());
    return false;
  }
  function loop(direction) {
    if (!shouldLoop(direction)) return;
    const loopDistance = contentSize * (direction * -1);
    vectors.forEach((v2) => v2.add(loopDistance));
  }
  const self = {
    loop
  };
  return self;
}
function ScrollProgress(limit) {
  const {
    max,
    length
  } = limit;
  function get(n) {
    const currentLocation = n - max;
    return length ? currentLocation / -length : 0;
  }
  const self = {
    get
  };
  return self;
}
function ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll) {
  const {
    startEdge,
    endEdge
  } = axis;
  const {
    groupSlides
  } = slidesToScroll;
  const alignments = measureSizes().map(alignment.measure);
  const snaps = measureUnaligned();
  const snapsAligned = measureAligned();
  function measureSizes() {
    return groupSlides(slideRects).map((rects) => arrayLast(rects)[endEdge] - rects[0][startEdge]).map(mathAbs);
  }
  function measureUnaligned() {
    return slideRects.map((rect) => containerRect[startEdge] - rect[startEdge]).map((snap) => -mathAbs(snap));
  }
  function measureAligned() {
    return groupSlides(snaps).map((g2) => g2[0]).map((snap, index) => snap + alignments[index]);
  }
  const self = {
    snaps,
    snapsAligned
  };
  return self;
}
function SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes) {
  const {
    groupSlides
  } = slidesToScroll;
  const {
    min,
    max
  } = scrollContainLimit;
  const slideRegistry = createSlideRegistry();
  function createSlideRegistry() {
    const groupedSlideIndexes = groupSlides(slideIndexes);
    const doNotContain = !containSnaps || containScroll === "keepSnaps";
    if (scrollSnaps.length === 1) return [slideIndexes];
    if (doNotContain) return groupedSlideIndexes;
    return groupedSlideIndexes.slice(min, max).map((group, index, groups) => {
      const isFirst = !index;
      const isLast = arrayIsLastIndex(groups, index);
      if (isFirst) {
        const range = arrayLast(groups[0]) + 1;
        return arrayFromNumber(range);
      }
      if (isLast) {
        const range = arrayLastIndex(slideIndexes) - arrayLast(groups)[0] + 1;
        return arrayFromNumber(range, arrayLast(groups)[0]);
      }
      return group;
    });
  }
  const self = {
    slideRegistry
  };
  return self;
}
function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
  const {
    reachedAny,
    removeOffset,
    constrain
  } = limit;
  function minDistance(distances) {
    return distances.concat().sort((a2, b2) => mathAbs(a2) - mathAbs(b2))[0];
  }
  function findTargetSnap(target) {
    const distance = loop ? removeOffset(target) : constrain(target);
    const ascDiffsToSnaps = scrollSnaps.map((snap, index2) => ({
      diff: shortcut(snap - distance, 0),
      index: index2
    })).sort((d1, d2) => mathAbs(d1.diff) - mathAbs(d2.diff));
    const {
      index
    } = ascDiffsToSnaps[0];
    return {
      index,
      distance
    };
  }
  function shortcut(target, direction) {
    const targets = [target, target + contentSize, target - contentSize];
    if (!loop) return target;
    if (!direction) return minDistance(targets);
    const matchingTargets = targets.filter((t2) => mathSign(t2) === direction);
    if (matchingTargets.length) return minDistance(matchingTargets);
    return arrayLast(targets) - contentSize;
  }
  function byIndex(index, direction) {
    const diffToSnap = scrollSnaps[index] - targetVector.get();
    const distance = shortcut(diffToSnap, direction);
    return {
      index,
      distance
    };
  }
  function byDistance(distance, snap) {
    const target = targetVector.get() + distance;
    const {
      index,
      distance: targetSnapDistance
    } = findTargetSnap(target);
    const reachedBound = !loop && reachedAny(target);
    if (!snap || reachedBound) return {
      index,
      distance
    };
    const diffToSnap = scrollSnaps[index] - targetSnapDistance;
    const snapDistance = distance + shortcut(diffToSnap, 0);
    return {
      index,
      distance: snapDistance
    };
  }
  const self = {
    byDistance,
    byIndex,
    shortcut
  };
  return self;
}
function ScrollTo(animation, indexCurrent, indexPrevious, scrollBody, scrollTarget, targetVector, eventHandler) {
  function scrollTo(target) {
    const distanceDiff = target.distance;
    const indexDiff = target.index !== indexCurrent.get();
    targetVector.add(distanceDiff);
    if (distanceDiff) {
      if (scrollBody.duration()) {
        animation.start();
      } else {
        animation.update();
        animation.render(1);
        animation.update();
      }
    }
    if (indexDiff) {
      indexPrevious.set(indexCurrent.get());
      indexCurrent.set(target.index);
      eventHandler.emit("select");
    }
  }
  function distance(n, snap) {
    const target = scrollTarget.byDistance(n, snap);
    scrollTo(target);
  }
  function index(n, direction) {
    const targetIndex = indexCurrent.clone().set(n);
    const target = scrollTarget.byIndex(targetIndex.get(), direction);
    scrollTo(target);
  }
  const self = {
    distance,
    index
  };
  return self;
}
function SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus) {
  const focusListenerOptions = {
    passive: true,
    capture: true
  };
  let lastTabPressTime = 0;
  function init(emblaApi) {
    if (!watchFocus) return;
    function defaultCallback(index) {
      const nowTime = (/* @__PURE__ */ new Date()).getTime();
      const diffTime = nowTime - lastTabPressTime;
      if (diffTime > 10) return;
      eventHandler.emit("slideFocusStart");
      root.scrollLeft = 0;
      const group = slideRegistry.findIndex((group2) => group2.includes(index));
      if (!isNumber(group)) return;
      scrollBody.useDuration(0);
      scrollTo.index(group, 0);
      eventHandler.emit("slideFocus");
    }
    eventStore.add(document, "keydown", registerTabPress, false);
    slides.forEach((slide, slideIndex) => {
      eventStore.add(slide, "focus", (evt) => {
        if (isBoolean(watchFocus) || watchFocus(emblaApi, evt)) {
          defaultCallback(slideIndex);
        }
      }, focusListenerOptions);
    });
  }
  function registerTabPress(event) {
    if (event.code === "Tab") lastTabPressTime = (/* @__PURE__ */ new Date()).getTime();
  }
  const self = {
    init
  };
  return self;
}
function Vector1D(initialValue) {
  let value = initialValue;
  function get() {
    return value;
  }
  function set(n) {
    value = normalizeInput(n);
  }
  function add(n) {
    value += normalizeInput(n);
  }
  function subtract(n) {
    value -= normalizeInput(n);
  }
  function normalizeInput(n) {
    return isNumber(n) ? n : n.get();
  }
  const self = {
    get,
    set,
    add,
    subtract
  };
  return self;
}
function Translate(axis, container) {
  const translate = axis.scroll === "x" ? x : y2;
  const containerStyle = container.style;
  let disabled = false;
  function x(n) {
    return `translate3d(${n}px,0px,0px)`;
  }
  function y2(n) {
    return `translate3d(0px,${n}px,0px)`;
  }
  function to(target) {
    if (disabled) return;
    containerStyle.transform = translate(axis.direction(target));
  }
  function toggleActive(active) {
    disabled = !active;
  }
  function clear() {
    if (disabled) return;
    containerStyle.transform = "";
    if (!container.getAttribute("style")) container.removeAttribute("style");
  }
  const self = {
    clear,
    to,
    toggleActive
  };
  return self;
}
function SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, location, slides) {
  const roundingSafety = 0.5;
  const ascItems = arrayKeys(slideSizesWithGaps);
  const descItems = arrayKeys(slideSizesWithGaps).reverse();
  const loopPoints = startPoints().concat(endPoints());
  function removeSlideSizes(indexes, from) {
    return indexes.reduce((a2, i) => {
      return a2 - slideSizesWithGaps[i];
    }, from);
  }
  function slidesInGap(indexes, gap) {
    return indexes.reduce((a2, i) => {
      const remainingGap = removeSlideSizes(a2, gap);
      return remainingGap > 0 ? a2.concat([i]) : a2;
    }, []);
  }
  function findSlideBounds(offset) {
    return snaps.map((snap, index) => ({
      start: snap - slideSizes[index] + roundingSafety + offset,
      end: snap + viewSize - roundingSafety + offset
    }));
  }
  function findLoopPoints(indexes, offset, isEndEdge) {
    const slideBounds = findSlideBounds(offset);
    return indexes.map((index) => {
      const initial = isEndEdge ? 0 : -contentSize;
      const altered = isEndEdge ? contentSize : 0;
      const boundEdge = isEndEdge ? "end" : "start";
      const loopPoint = slideBounds[index][boundEdge];
      return {
        index,
        loopPoint,
        slideLocation: Vector1D(-1),
        translate: Translate(axis, slides[index]),
        target: () => location.get() > loopPoint ? initial : altered
      };
    });
  }
  function startPoints() {
    const gap = scrollSnaps[0];
    const indexes = slidesInGap(descItems, gap);
    return findLoopPoints(indexes, contentSize, false);
  }
  function endPoints() {
    const gap = viewSize - scrollSnaps[0] - 1;
    const indexes = slidesInGap(ascItems, gap);
    return findLoopPoints(indexes, -contentSize, true);
  }
  function canLoop() {
    return loopPoints.every(({
      index
    }) => {
      const otherIndexes = ascItems.filter((i) => i !== index);
      return removeSlideSizes(otherIndexes, viewSize) <= 0.1;
    });
  }
  function loop() {
    loopPoints.forEach((loopPoint) => {
      const {
        target,
        translate,
        slideLocation
      } = loopPoint;
      const shiftLocation = target();
      if (shiftLocation === slideLocation.get()) return;
      translate.to(shiftLocation);
      slideLocation.set(shiftLocation);
    });
  }
  function clear() {
    loopPoints.forEach((loopPoint) => loopPoint.translate.clear());
  }
  const self = {
    canLoop,
    clear,
    loop,
    loopPoints
  };
  return self;
}
function SlidesHandler(container, eventHandler, watchSlides) {
  let mutationObserver;
  let destroyed = false;
  function init(emblaApi) {
    if (!watchSlides) return;
    function defaultCallback(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          emblaApi.reInit();
          eventHandler.emit("slidesChanged");
          break;
        }
      }
    }
    mutationObserver = new MutationObserver((mutations) => {
      if (destroyed) return;
      if (isBoolean(watchSlides) || watchSlides(emblaApi, mutations)) {
        defaultCallback(mutations);
      }
    });
    mutationObserver.observe(container, {
      childList: true
    });
  }
  function destroy() {
    if (mutationObserver) mutationObserver.disconnect();
    destroyed = true;
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function SlidesInView(container, slides, eventHandler, threshold) {
  const intersectionEntryMap = {};
  let inViewCache = null;
  let notInViewCache = null;
  let intersectionObserver;
  let destroyed = false;
  function init() {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (destroyed) return;
      entries.forEach((entry) => {
        const index = slides.indexOf(entry.target);
        intersectionEntryMap[index] = entry;
      });
      inViewCache = null;
      notInViewCache = null;
      eventHandler.emit("slidesInView");
    }, {
      root: container.parentElement,
      threshold
    });
    slides.forEach((slide) => intersectionObserver.observe(slide));
  }
  function destroy() {
    if (intersectionObserver) intersectionObserver.disconnect();
    destroyed = true;
  }
  function createInViewList(inView) {
    return objectKeys(intersectionEntryMap).reduce((list, slideIndex) => {
      const index = parseInt(slideIndex);
      const {
        isIntersecting
      } = intersectionEntryMap[index];
      const inViewMatch = inView && isIntersecting;
      const notInViewMatch = !inView && !isIntersecting;
      if (inViewMatch || notInViewMatch) list.push(index);
      return list;
    }, []);
  }
  function get(inView = true) {
    if (inView && inViewCache) return inViewCache;
    if (!inView && notInViewCache) return notInViewCache;
    const slideIndexes = createInViewList(inView);
    if (inView) inViewCache = slideIndexes;
    if (!inView) notInViewCache = slideIndexes;
    return slideIndexes;
  }
  const self = {
    init,
    destroy,
    get
  };
  return self;
}
function SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow) {
  const {
    measureSize,
    startEdge,
    endEdge
  } = axis;
  const withEdgeGap = slideRects[0] && readEdgeGap;
  const startGap = measureStartGap();
  const endGap = measureEndGap();
  const slideSizes = slideRects.map(measureSize);
  const slideSizesWithGaps = measureWithGaps();
  function measureStartGap() {
    if (!withEdgeGap) return 0;
    const slideRect = slideRects[0];
    return mathAbs(containerRect[startEdge] - slideRect[startEdge]);
  }
  function measureEndGap() {
    if (!withEdgeGap) return 0;
    const style = ownerWindow.getComputedStyle(arrayLast(slides));
    return parseFloat(style.getPropertyValue(`margin-${endEdge}`));
  }
  function measureWithGaps() {
    return slideRects.map((rect, index, rects) => {
      const isFirst = !index;
      const isLast = arrayIsLastIndex(rects, index);
      if (isFirst) return slideSizes[index] + startGap;
      if (isLast) return slideSizes[index] + endGap;
      return rects[index + 1][startEdge] - rect[startEdge];
    }).map(mathAbs);
  }
  const self = {
    slideSizes,
    slideSizesWithGaps,
    startGap,
    endGap
  };
  return self;
}
function SlidesToScroll(axis, viewSize, slidesToScroll, loop, containerRect, slideRects, startGap, endGap, pixelTolerance) {
  const {
    startEdge,
    endEdge,
    direction
  } = axis;
  const groupByNumber = isNumber(slidesToScroll);
  function byNumber(array, groupSize) {
    return arrayKeys(array).filter((i) => i % groupSize === 0).map((i) => array.slice(i, i + groupSize));
  }
  function bySize(array) {
    if (!array.length) return [];
    return arrayKeys(array).reduce((groups, rectB, index) => {
      const rectA = arrayLast(groups) || 0;
      const isFirst = rectA === 0;
      const isLast = rectB === arrayLastIndex(array);
      const edgeA = containerRect[startEdge] - slideRects[rectA][startEdge];
      const edgeB = containerRect[startEdge] - slideRects[rectB][endEdge];
      const gapA = !loop && isFirst ? direction(startGap) : 0;
      const gapB = !loop && isLast ? direction(endGap) : 0;
      const chunkSize = mathAbs(edgeB - gapB - (edgeA + gapA));
      if (index && chunkSize > viewSize + pixelTolerance) groups.push(rectB);
      if (isLast) groups.push(array.length);
      return groups;
    }, []).map((currentSize, index, groups) => {
      const previousSize = Math.max(groups[index - 1] || 0);
      return array.slice(previousSize, currentSize);
    });
  }
  function groupSlides(array) {
    return groupByNumber ? byNumber(array, slidesToScroll) : bySize(array);
  }
  const self = {
    groupSlides
  };
  return self;
}
function Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler) {
  const {
    align,
    axis: scrollAxis,
    direction,
    startIndex,
    loop,
    duration,
    dragFree,
    dragThreshold,
    inViewThreshold,
    slidesToScroll: groupSlides,
    skipSnaps,
    containScroll,
    watchResize,
    watchSlides,
    watchDrag,
    watchFocus
  } = options;
  const pixelTolerance = 2;
  const nodeRects = NodeRects();
  const containerRect = nodeRects.measure(container);
  const slideRects = slides.map(nodeRects.measure);
  const axis = Axis(scrollAxis, direction);
  const viewSize = axis.measureSize(containerRect);
  const percentOfView = PercentOfView(viewSize);
  const alignment = Alignment(align, viewSize);
  const containSnaps = !loop && !!containScroll;
  const readEdgeGap = loop || !!containScroll;
  const {
    slideSizes,
    slideSizesWithGaps,
    startGap,
    endGap
  } = SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow);
  const slidesToScroll = SlidesToScroll(axis, viewSize, groupSlides, loop, containerRect, slideRects, startGap, endGap, pixelTolerance);
  const {
    snaps,
    snapsAligned
  } = ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll);
  const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps);
  const {
    snapsContained,
    scrollContainLimit
  } = ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance);
  const scrollSnaps = containSnaps ? snapsContained : snapsAligned;
  const {
    limit
  } = ScrollLimit(contentSize, scrollSnaps, loop);
  const index = Counter(arrayLastIndex(scrollSnaps), startIndex, loop);
  const indexPrevious = index.clone();
  const slideIndexes = arrayKeys(slides);
  const update = ({
    dragHandler,
    scrollBody: scrollBody2,
    scrollBounds,
    options: {
      loop: loop2
    }
  }, timeStep) => {
    if (!loop2) scrollBounds.constrain(dragHandler.pointerDown());
    scrollBody2.seek(timeStep);
  };
  const render = ({
    scrollBody: scrollBody2,
    translate,
    location: location2,
    offsetLocation: offsetLocation2,
    scrollLooper,
    slideLooper,
    dragHandler,
    animation: animation2,
    eventHandler: eventHandler2,
    scrollBounds,
    options: {
      loop: loop2
    }
  }, lagOffset) => {
    const shouldSettle = scrollBody2.settled();
    const withinBounds = !scrollBounds.shouldConstrain();
    const hasSettled = loop2 ? shouldSettle : shouldSettle && withinBounds;
    if (hasSettled && !dragHandler.pointerDown()) {
      animation2.stop();
      eventHandler2.emit("settle");
    }
    if (!hasSettled) eventHandler2.emit("scroll");
    const interpolatedLocation = location2.get() * lagOffset + previousLocation.get() * (1 - lagOffset);
    offsetLocation2.set(interpolatedLocation);
    if (loop2) {
      scrollLooper.loop(scrollBody2.direction());
      slideLooper.loop();
    }
    translate.to(offsetLocation2.get());
  };
  const animation = Animations(ownerDocument, ownerWindow, (timeStep) => update(engine, timeStep), (lagOffset) => render(engine, lagOffset));
  const friction = 0.68;
  const startLocation = scrollSnaps[index.get()];
  const location = Vector1D(startLocation);
  const previousLocation = Vector1D(startLocation);
  const offsetLocation = Vector1D(startLocation);
  const target = Vector1D(startLocation);
  const scrollBody = ScrollBody(location, offsetLocation, previousLocation, target, duration, friction);
  const scrollTarget = ScrollTarget(loop, scrollSnaps, contentSize, limit, target);
  const scrollTo = ScrollTo(animation, index, indexPrevious, scrollBody, scrollTarget, target, eventHandler);
  const scrollProgress = ScrollProgress(limit);
  const eventStore = EventStore();
  const slidesInView = SlidesInView(container, slides, eventHandler, inViewThreshold);
  const {
    slideRegistry
  } = SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes);
  const slideFocus = SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus);
  const engine = {
    ownerDocument,
    ownerWindow,
    eventHandler,
    containerRect,
    slideRects,
    animation,
    axis,
    dragHandler: DragHandler(axis, root, ownerDocument, ownerWindow, target, DragTracker(axis, ownerWindow), location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, friction, watchDrag),
    eventStore,
    percentOfView,
    index,
    indexPrevious,
    limit,
    location,
    offsetLocation,
    previousLocation,
    options,
    resizeHandler: ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects),
    scrollBody,
    scrollBounds: ScrollBounds(limit, offsetLocation, target, scrollBody, percentOfView),
    scrollLooper: ScrollLooper(contentSize, limit, offsetLocation, [location, offsetLocation, previousLocation, target]),
    scrollProgress,
    scrollSnapList: scrollSnaps.map(scrollProgress.get),
    scrollSnaps,
    scrollTarget,
    scrollTo,
    slideLooper: SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, offsetLocation, slides),
    slideFocus,
    slidesHandler: SlidesHandler(container, eventHandler, watchSlides),
    slidesInView,
    slideIndexes,
    slideRegistry,
    slidesToScroll,
    target,
    translate: Translate(axis, container)
  };
  return engine;
}
function EventHandler() {
  let listeners = {};
  let api;
  function init(emblaApi) {
    api = emblaApi;
  }
  function getListeners(evt) {
    return listeners[evt] || [];
  }
  function emit(evt) {
    getListeners(evt).forEach((e) => e(api, evt));
    return self;
  }
  function on2(evt, cb) {
    listeners[evt] = getListeners(evt).concat([cb]);
    return self;
  }
  function off(evt, cb) {
    listeners[evt] = getListeners(evt).filter((e) => e !== cb);
    return self;
  }
  function clear() {
    listeners = {};
  }
  const self = {
    init,
    emit,
    off,
    on: on2,
    clear
  };
  return self;
}
const defaultOptions = {
  align: "center",
  axis: "x",
  container: null,
  slides: null,
  containScroll: "trimSnaps",
  direction: "ltr",
  slidesToScroll: 1,
  inViewThreshold: 0,
  breakpoints: {},
  dragFree: false,
  dragThreshold: 10,
  loop: false,
  skipSnaps: false,
  duration: 25,
  startIndex: 0,
  active: true,
  watchDrag: true,
  watchResize: true,
  watchSlides: true,
  watchFocus: true
};
function OptionsHandler(ownerWindow) {
  function mergeOptions(optionsA, optionsB) {
    return objectsMergeDeep(optionsA, optionsB || {});
  }
  function optionsAtMedia(options) {
    const optionsAtMedia2 = options.breakpoints || {};
    const matchedMediaOptions = objectKeys(optionsAtMedia2).filter((media) => ownerWindow.matchMedia(media).matches).map((media) => optionsAtMedia2[media]).reduce((a2, mediaOption) => mergeOptions(a2, mediaOption), {});
    return mergeOptions(options, matchedMediaOptions);
  }
  function optionsMediaQueries(optionsList) {
    return optionsList.map((options) => objectKeys(options.breakpoints || {})).reduce((acc, mediaQueries) => acc.concat(mediaQueries), []).map(ownerWindow.matchMedia);
  }
  const self = {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  };
  return self;
}
function PluginsHandler(optionsHandler) {
  let activePlugins = [];
  function init(emblaApi, plugins) {
    activePlugins = plugins.filter(({
      options
    }) => optionsHandler.optionsAtMedia(options).active !== false);
    activePlugins.forEach((plugin) => plugin.init(emblaApi, optionsHandler));
    return plugins.reduce((map, plugin) => Object.assign(map, {
      [plugin.name]: plugin
    }), {});
  }
  function destroy() {
    activePlugins = activePlugins.filter((plugin) => plugin.destroy());
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function EmblaCarousel(root, userOptions, userPlugins) {
  const ownerDocument = root.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  const optionsHandler = OptionsHandler(ownerWindow);
  const pluginsHandler = PluginsHandler(optionsHandler);
  const mediaHandlers = EventStore();
  const eventHandler = EventHandler();
  const {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  } = optionsHandler;
  const {
    on: on2,
    off,
    emit
  } = eventHandler;
  const reInit = reActivate;
  let destroyed = false;
  let engine;
  let optionsBase = mergeOptions(defaultOptions, EmblaCarousel.globalOptions);
  let options = mergeOptions(optionsBase);
  let pluginList = [];
  let pluginApis;
  let container;
  let slides;
  function storeElements() {
    const {
      container: userContainer,
      slides: userSlides
    } = options;
    const customContainer = isString(userContainer) ? root.querySelector(userContainer) : userContainer;
    container = customContainer || root.children[0];
    const customSlides = isString(userSlides) ? container.querySelectorAll(userSlides) : userSlides;
    slides = [].slice.call(customSlides || container.children);
  }
  function createEngine(options2) {
    const engine2 = Engine(root, container, slides, ownerDocument, ownerWindow, options2, eventHandler);
    if (options2.loop && !engine2.slideLooper.canLoop()) {
      const optionsWithoutLoop = Object.assign({}, options2, {
        loop: false
      });
      return createEngine(optionsWithoutLoop);
    }
    return engine2;
  }
  function activate(withOptions, withPlugins) {
    if (destroyed) return;
    optionsBase = mergeOptions(optionsBase, withOptions);
    options = optionsAtMedia(optionsBase);
    pluginList = withPlugins || pluginList;
    storeElements();
    engine = createEngine(options);
    optionsMediaQueries([optionsBase, ...pluginList.map(({
      options: options2
    }) => options2)]).forEach((query) => mediaHandlers.add(query, "change", reActivate));
    if (!options.active) return;
    engine.translate.to(engine.location.get());
    engine.animation.init();
    engine.slidesInView.init();
    engine.slideFocus.init(self);
    engine.eventHandler.init(self);
    engine.resizeHandler.init(self);
    engine.slidesHandler.init(self);
    if (engine.options.loop) engine.slideLooper.loop();
    if (container.offsetParent && slides.length) engine.dragHandler.init(self);
    pluginApis = pluginsHandler.init(self, pluginList);
  }
  function reActivate(withOptions, withPlugins) {
    const startIndex = selectedScrollSnap();
    deActivate();
    activate(mergeOptions({
      startIndex
    }, withOptions), withPlugins);
    eventHandler.emit("reInit");
  }
  function deActivate() {
    engine.dragHandler.destroy();
    engine.eventStore.clear();
    engine.translate.clear();
    engine.slideLooper.clear();
    engine.resizeHandler.destroy();
    engine.slidesHandler.destroy();
    engine.slidesInView.destroy();
    engine.animation.destroy();
    pluginsHandler.destroy();
    mediaHandlers.clear();
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    mediaHandlers.clear();
    deActivate();
    eventHandler.emit("destroy");
    eventHandler.clear();
  }
  function scrollTo(index, jump, direction) {
    if (!options.active || destroyed) return;
    engine.scrollBody.useBaseFriction().useDuration(jump === true ? 0 : options.duration);
    engine.scrollTo.index(index, direction || 0);
  }
  function scrollNext(jump) {
    const next = engine.index.add(1).get();
    scrollTo(next, jump, -1);
  }
  function scrollPrev(jump) {
    const prev = engine.index.add(-1).get();
    scrollTo(prev, jump, 1);
  }
  function canScrollNext() {
    const next = engine.index.add(1).get();
    return next !== selectedScrollSnap();
  }
  function canScrollPrev() {
    const prev = engine.index.add(-1).get();
    return prev !== selectedScrollSnap();
  }
  function scrollSnapList() {
    return engine.scrollSnapList;
  }
  function scrollProgress() {
    return engine.scrollProgress.get(engine.location.get());
  }
  function selectedScrollSnap() {
    return engine.index.get();
  }
  function previousScrollSnap() {
    return engine.indexPrevious.get();
  }
  function slidesInView() {
    return engine.slidesInView.get();
  }
  function slidesNotInView() {
    return engine.slidesInView.get(false);
  }
  function plugins() {
    return pluginApis;
  }
  function internalEngine() {
    return engine;
  }
  function rootNode() {
    return root;
  }
  function containerNode() {
    return container;
  }
  function slideNodes() {
    return slides;
  }
  const self = {
    canScrollNext,
    canScrollPrev,
    containerNode,
    internalEngine,
    destroy,
    off,
    on: on2,
    emit,
    plugins,
    previousScrollSnap,
    reInit,
    rootNode,
    scrollNext,
    scrollPrev,
    scrollProgress,
    scrollSnapList,
    scrollTo,
    selectedScrollSnap,
    slideNodes,
    slidesInView,
    slidesNotInView
  };
  activate(userOptions, userPlugins);
  setTimeout(() => eventHandler.emit("init"), 0);
  return self;
}
EmblaCarousel.globalOptions = void 0;
function useEmblaCarousel(options = {}, plugins = []) {
  const storedOptions = reactExports.useRef(options);
  const storedPlugins = reactExports.useRef(plugins);
  const [emblaApi, setEmblaApi] = reactExports.useState();
  const [viewport, setViewport] = reactExports.useState();
  const reInit = reactExports.useCallback(() => {
    if (emblaApi) emblaApi.reInit(storedOptions.current, storedPlugins.current);
  }, [emblaApi]);
  reactExports.useEffect(() => {
    if (canUseDOM() && viewport) {
      EmblaCarousel.globalOptions = useEmblaCarousel.globalOptions;
      const newEmblaApi = EmblaCarousel(viewport, storedOptions.current, storedPlugins.current);
      setEmblaApi(newEmblaApi);
      return () => newEmblaApi.destroy();
    } else {
      setEmblaApi(void 0);
    }
  }, [viewport, setEmblaApi]);
  reactExports.useEffect(() => {
    if (areOptionsEqual(storedOptions.current, options)) return;
    storedOptions.current = options;
    reInit();
  }, [options, reInit]);
  reactExports.useEffect(() => {
    if (arePluginsEqual(storedPlugins.current, plugins)) return;
    storedPlugins.current = plugins;
    reInit();
  }, [plugins, reInit]);
  return [setViewport, emblaApi];
}
useEmblaCarousel.globalOptions = void 0;
const CarouselContext = reactExports.createContext(null);
function useCarousel() {
  const context = reactExports.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
const Carousel = reactExports.forwardRef(
  ({
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y"
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = reactExports.useState(false);
    const [canScrollNext, setCanScrollNext] = reactExports.useState(false);
    const onSelect = reactExports.useCallback((api2) => {
      if (!api2) {
        return;
      }
      setCanScrollPrev(api2.canScrollPrev());
      setCanScrollNext(api2.canScrollNext());
    }, []);
    const scrollPrev = reactExports.useCallback(() => {
      api == null ? void 0 : api.scrollPrev();
    }, [api]);
    const scrollNext = reactExports.useCallback(() => {
      api == null ? void 0 : api.scrollNext();
    }, [api]);
    const handleKeyDown = reactExports.useCallback(
      (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );
    reactExports.useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      setApi(api);
    }, [api, setApi]);
    reactExports.useEffect(() => {
      if (!api) {
        return;
      }
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api == null ? void 0 : api.off("select", onSelect);
      };
    }, [api, onSelect]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CarouselContext.Provider,
      {
        value: {
          carouselRef,
          api,
          opts,
          orientation: orientation || ((opts == null ? void 0 : opts.axis) === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref,
            onKeyDownCapture: handleKeyDown,
            className: cn$1("relative", className),
            role: "region",
            "aria-roledescription": "carousel",
            ...props,
            children
          }
        )
      }
    );
  }
);
Carousel.displayName = "Carousel";
const CarouselContent = reactExports.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: carouselRef, className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn$1(
        "flex",
        orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
        className
      ),
      ...props
    }
  ) });
});
CarouselContent.displayName = "CarouselContent";
const CarouselItem = reactExports.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      role: "group",
      "aria-roledescription": "slide",
      className: cn$1(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      ),
      ...props
    }
  );
});
CarouselItem.displayName = "CarouselItem";
const CarouselPrevious = reactExports.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      ref,
      variant,
      size,
      className: cn$1(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal" ? "-left-12 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollPrev,
      onClick: scrollPrev,
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftIcon, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
});
CarouselPrevious.displayName = "CarouselPrevious";
const CarouselNext = reactExports.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      ref,
      variant,
      size,
      className: cn$1(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal" ? "-right-12 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollNext,
      onClick: scrollNext,
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightIcon, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
});
CarouselNext.displayName = "CarouselNext";
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog$1 = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog$1.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal$1 = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { ...dialogScope, ...portalProps });
};
AlertDialogPortal$1.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay$1.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var AlertDialogContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WarningProvider,
      {
        contentName: CONTENT_NAME,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              var _a;
              event.preventDefault();
              (_a = cancelRef.current) == null ? void 0 : _a.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent$1.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription$1.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction$1.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel$1.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  reactExports.useEffect(() => {
    var _a;
    const hasDescription = document.getElementById(
      (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root2 = AlertDialog$1;
var Portal2 = AlertDialogPortal$1;
var Overlay2 = AlertDialogOverlay$1;
var Content2 = AlertDialogContent$1;
var Action = AlertDialogAction$1;
var Cancel = AlertDialogCancel$1;
var Title2 = AlertDialogTitle$1;
var Description2 = AlertDialogDescription$1;
const AlertDialog = Root2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn$1(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn$1(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn$1(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn$1(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn$1("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn$1("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Action,
  {
    ref,
    className: cn$1(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn$1(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
function useSubscriptionPlans() {
  const apiUrl = useApiUrl();
  const { data: plansData, isLoading: plansAreLoading } = ii({
    url: `${apiUrl}/api/account/subscription/plans`,
    method: "get"
  });
  return { plansData, plansAreLoading };
}
function useSubmitSubscriptionChange(fromContext = false) {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { refetchSubscription } = fromContext ? useSubscription() : useSubscriptionContext();
  const { mutate, isLoading: isPlanChanging } = pi();
  const submitPlanChange = (
    //useCallback(
    async (plan, paymentMethodId) => {
      const values = {
        plan: plan.identifier
      };
      if (paymentMethodId) {
        values.payment_method_id = paymentMethodId;
      }
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/change`,
          method: "post",
          values
        },
        {
          async onSuccess() {
            open == null ? void 0 : open({
              type: "success",
              message: "Subscription change initiated"
            });
            refetchSubscription();
          },
          onError(error) {
            open == null ? void 0 : open({
              type: "error",
              message: `Failed to change subscription: ${error.message}`
            });
          }
        }
      );
    }
  );
  return {
    isPlanChanging,
    submitPlanChange
  };
}
function p$1(r, n, e) {
  for (var t2 = new Array(e), i = 0, u2 = n; i < e; )
    t2[i] = r[u2], i = i + 1 | 0, u2 = u2 + 1 | 0;
  return t2;
}
function m$1(r, n) {
  for (; ; ) {
    var e = n, t2 = r, i = t2.length, u2 = i === 0 ? 1 : i, o = e.length, f = u2 - o | 0;
    if (f === 0) return t2.apply(null, e);
    if (f >= 0)
      return /* @__PURE__ */ function(l, c) {
        return function(_2) {
          return m$1(l, c.concat([_2]));
        };
      }(t2, e);
    n = p$1(e, u2, -f | 0), r = t2.apply(null, p$1(e, 0, u2));
  }
}
function d(r, n, e, t2) {
  var i = r.length;
  if (i === 3) return r(n, e, t2);
  switch (i) {
    case 1:
      return m$1(r(n), [e, t2]);
    case 2:
      return m$1(r(n, e), [t2]);
    case 3:
      return r(n, e, t2);
    case 4:
      return function(u2) {
        return r(n, e, t2, u2);
      };
    case 5:
      return function(u2, o) {
        return r(n, e, t2, u2, o);
      };
    case 6:
      return function(u2, o, f) {
        return r(n, e, t2, u2, o, f);
      };
    case 7:
      return function(u2, o, f, l) {
        return r(n, e, t2, u2, o, f, l);
      };
    default:
      return m$1(r, [n, e, t2]);
  }
}
function a(r) {
  return r === void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: 0 } : r !== null && r.BS_PRIVATE_NESTED_SOME_NONE !== void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: r.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0 } : r;
}
function s$1(r) {
  if (!(r !== null && r.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) return r;
  var n = r.BS_PRIVATE_NESTED_SOME_NONE;
  if (n !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: n - 1 | 0 };
}
function A(r, n) {
  if (n in r) return a(r[n]);
}
function I(r) {
  for (var n = {}, e = r.length, t2 = 0; t2 < e; ++t2) {
    var i = r[t2];
    n[i[0]] = i[1];
  }
  return n;
}
function N$1(r) {
  if (typeof r == "string") return r;
}
function S$1(r) {
  if (typeof r == "object" && !Array.isArray(r) && r !== null) return a(r);
}
var y = 2147483647, g = -2147483648;
function M$1(r) {
  return r > y ? y : r < g ? g : Math.floor(r);
}
function E(r, n) {
  return M$1(Math.random() * (n - r | 0)) + r | 0;
}
function P$1(r, n) {
  for (var e = new Array(r), t2 = 0; t2 < r; ++t2) e[t2] = n;
  return e;
}
function b$1(r, n) {
  return r !== void 0 ? s$1(r) : n;
}
function T$1(r) {
  var n = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return P$1(32, 0).reduce(function(e, t2) {
    var i = E(0, n.length), u2 = n.charAt(i);
    return e + u2;
  }, "");
}
function R$1(r) {
  var n = r !== void 0 ? b$1(S$1(s$1(r)), {}) : {}, e = A(n, "env");
  if (e === void 0) return "";
  var t2 = N$1(s$1(e));
  return t2 !== void 0 ? t2 : "";
}
function V$1(r, n) {
  return new Promise(function(e, t2) {
    var i = T$1(), u2 = Date.now(), o = R$1(n), f;
    switch (o) {
      case "PROD":
        f = "https://checkout.hyperswitch.io/v0/HyperLoader.js";
        break;
      case "SANDBOX":
        f = "https://beta.hyperswitch.io/v1/HyperLoader.js";
        break;
      default:
        f = r.startsWith("pk_prd_") ? "https://checkout.hyperswitch.io/v0/HyperLoader.js" : "https://beta.hyperswitch.io/v1/HyperLoader.js";
    }
    var l = I([
      ["sessionID", i],
      ["timeStamp", String(u2)]
    ]);
    if (document.querySelectorAll('script[src="' + f + '"]').length === 0) {
      var c = document.createElement("script");
      c.src = f, c.onload = function(w2) {
        var C = window.Hyper;
        if (C != null) return e(d(C, r, n, l));
      }, c.onerror = function(w2) {
        t2(w2);
      }, document.body.appendChild(c);
      return;
    }
    console.warn(
      "INTEGRATION WARNING: There is already an existing script tag for " + f + ". Multiple additions of HyperLoader.js is not permitted, please add it on the top level only once."
    );
    var _2 = window.Hyper;
    if (_2 != null) return e(d(_2, r, n, l));
  });
}
const defaultContextValue = {
  subscription: void 0,
  isLoading: false,
  plans: [],
  selectedPlan: null,
  handlePlanSelection: () => {
  },
  isPlanChanging: false,
  submitPlanChange: async () => {
  },
  refetchSubscription: async () => ({}),
  // This is a placeholder and will be overwritten in the provider
  hyperState: {
    isHyperLoaded: false,
    error: null
  },
  setEphemeralKey: (key) => {
  }
};
const SubscriptionContext = reactExports.createContext(defaultContextValue);
function useSubscriptionContext() {
  const context = reactExports.useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }
  return context;
}
function SubscriptionProvider({ children }) {
  var _a;
  const { subscriptionData, subscriptionIsLoading, refetchSubscription } = useSubscription();
  const { plansData, plansAreLoading } = useSubscriptionPlans();
  const { isPlanChanging, submitPlanChange } = useSubmitSubscriptionChange(true);
  const [selectedPlan, setSelectedPlan] = reactExports.useState(
    null
  );
  const [ephemeralKey, setEphemeralKey] = reactExports.useState(null);
  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
  };
  const hyperPromiseRef = reactExports.useRef(null);
  const [hyperState, setHyperState] = reactExports.useState({
    isHyperLoaded: false,
    error: null
  });
  const initializeHyper = reactExports.useCallback(() => {
    var _a2;
    if ((_a2 = subscriptionData == null ? void 0 : subscriptionData.payment_info) == null ? void 0 : _a2.publishable_key) {
      setHyperState((prev) => ({ ...prev, isLoading: true, error: null }));
      const promise = V$1(subscriptionData.payment_info.publishable_key, {
        env: "SANDBOX",
        ephemeralKey
      });
      if (promise) {
        hyperPromiseRef.current = promise;
        promise.then(() => {
          setHyperState((prev) => ({
            ...prev,
            isLoading: false,
            isHyperLoaded: true
          }));
        }).catch((error) => {
          console.error("Failed to load Hyper instance:", error);
          hyperPromiseRef.current = null;
          setHyperState((prev) => ({ ...prev, isLoading: false, error }));
        });
      } else {
        setHyperState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, [subscriptionIsLoading]);
  reactExports.useEffect(() => {
    if (!hyperPromiseRef.current) {
      initializeHyper();
    }
  }, [initializeHyper]);
  reactExports.useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);
  const value = {
    subscription: subscriptionData,
    isLoading: subscriptionIsLoading || plansAreLoading,
    plans: ((_a = plansData == null ? void 0 : plansData.data) == null ? void 0 : _a.plans) ?? [],
    selectedPlan,
    isPlanChanging,
    handlePlanSelection,
    submitPlanChange,
    refetchSubscription,
    hyperState: {
      isHyperLoaded: hyperState.isHyperLoaded,
      error: hyperState.error
    },
    hyperPromise: hyperPromiseRef.current,
    setEphemeralKey
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionContext.Provider, { value, children });
}
function useOnFreePlan() {
  const { subscriptionData } = useSubscription();
  const freePlanName = usePluginMeta("billing", "free_plan_name");
  const paidBillingEnabled = useIsPaidBillingEnabled();
  return paidBillingEnabled && freePlanName && (subscriptionData == null ? void 0 : subscriptionData.plan.name) === freePlanName;
}
function De$1(e, n) {
}
function $e() {
}
function Ue() {
}
function je(e) {
}
function Ie$1() {
}
function qe() {
}
function He$1(e) {
}
function Ge() {
}
function Ke() {
}
var le$1 = { on: De$1, collapse: $e, blur: Ue, update: je, destroy: Ie$1, unmount: qe, mount: He$1, focus: Ge, clear: Ke };
function Le(e) {
  if (typeof e == "boolean") return e;
}
function ze(e) {
  if (e === null) return null;
}
function Qe(e) {
  if (typeof e == "string") return e;
}
function Ye(e) {
  if (typeof e == "number") return e;
}
function Ze(e) {
  if (typeof e == "object" && !Array.isArray(e) && e !== null) return e;
}
function en(e) {
  if (Array.isArray(e)) return e;
}
var v = { bool: Le, $$null: ze, string: Qe, $$float: Ye, object: Ze, array: en };
function L(e, n, o) {
  for (var t2 = new Array(o), r = 0, a2 = n; r < o; ) t2[r] = e[a2], r = r + 1 | 0, a2 = a2 + 1 | 0;
  return t2;
}
function ce(e, n) {
  for (; ; ) {
    var o = n, t2 = e, r = t2.length, a2 = r === 0 ? 1 : r, m2 = o.length, l = a2 - m2 | 0;
    if (l === 0) return t2.apply(null, o);
    if (l >= 0) return /* @__PURE__ */ function(f, u2) {
      return function(i) {
        return ce(f, u2.concat([i]));
      };
    }(t2, o);
    n = L(o, a2, -l | 0), e = t2.apply(null, L(o, 0, a2));
  }
}
function rn(e, n) {
  var o = e.length;
  if (o === 1) return e(n);
  switch (o) {
    case 1:
      return e(n);
    case 2:
      return function(t2) {
        return e(n, t2);
      };
    case 3:
      return function(t2, r) {
        return e(n, t2, r);
      };
    case 4:
      return function(t2, r, a2) {
        return e(n, t2, r, a2);
      };
    case 5:
      return function(t2, r, a2, m2) {
        return e(n, t2, r, a2, m2);
      };
    case 6:
      return function(t2, r, a2, m2, l) {
        return e(n, t2, r, a2, m2, l);
      };
    case 7:
      return function(t2, r, a2, m2, l, f) {
        return e(n, t2, r, a2, m2, l, f);
      };
    default:
      return ce(e, [n]);
  }
}
function U$1(e) {
  var n = e.length;
  return n === 1 ? e : function(o) {
    return rn(e, o);
  };
}
function P(e) {
  return e === void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: 0 } : e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: e.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0 } : e;
}
function j(e) {
  if (!(e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) return e;
  var n = e.BS_PRIVATE_NESTED_SOME_NONE;
  if (n !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: n - 1 | 0 };
}
function on(e, n) {
  if (e !== void 0) return n(j(e));
}
function R(e, n) {
  return on(e, U$1(n));
}
function _(e, n) {
  return e !== void 0 ? j(e) : n;
}
function mn(e) {
  return Promise.resolve({});
}
function ln(e, n, o) {
  return Promise.resolve({});
}
function cn(e) {
  return Promise.resolve({});
}
function fe$1(e) {
  return e;
}
var b = { clientSecret: "", confirmPayment: mn, confirmCardPayment: ln, retrievePaymentIntent: cn, paymentRequest: fe$1 }, O = reactExports.createContext(b), sn = O.Provider, q = { make: sn }, z = { ephemeralKey: "", paymentRequest: fe$1 }, Q$1 = reactExports.createContext(z);
Q$1.Provider;
function k$2(e, n, o) {
  return _(R(e[n], v.string), o);
}
function H$1(e) {
  var n = _(v.object(e), {});
  return {
    fonts: _(R(n.fonts, v.array), []),
    locale: k$2(n, "locale", ""),
    clientSecret: k$2(n, "clientSecret", ""),
    appearance: _(R(n.appearance, v.object), {}),
    loader: k$2(n, "loader", "auto")
  };
}
function pe$1(e) {
}
function ye$1(e) {
}
function Ce$1() {
  return new Promise(function(e, n) {
    setTimeout(function() {
      e({});
    }, 1e3);
  });
}
function ve$1(e, n) {
  return le$1;
}
var dn = { fonts: [], locale: "", clientSecret: "", appearance: {}, loader: "" }, B$1 = { options: dn, update: pe$1, getElement: ye$1, fetchUpdates: Ce$1, create: ve$1 }, S = reactExports.createContext(B$1), pn = S.Provider, G$2 = { make: pn };
var yn = { fonts: [], locale: "", ephemeralKey: "", appearance: {}, loader: "" }, Y$2 = { options: yn, update: pe$1, getElement: ye$1, fetchUpdates: Ce$1, create: ve$1 }, Z$1 = reactExports.createContext(Y$2);
Z$1.Provider;
function vn(e) {
  var n = e.onClick, o = e.onBlur, t2 = e.onFocus, r = e.componentType, a2 = e.onReady, m2 = e.onChange, l = e.options, f = e.id, u2 = f !== void 0 ? f : "payment-Element", i = reactExports.useContext(O), y2 = reactExports.useContext(S), p2 = reactExports.useRef(null), d2 = y2.create(r, l);
  return reactExports.useEffect(function() {
    var c = y2.create(r, l);
    c.mount("#orca-elements-payment-element-" + u2);
  }, [p2, y2]), reactExports.useEffect(function() {
    d2.on("ready", a2), d2.on("focus", t2), d2.on("blur", o), d2.on("clickTriggered", n), d2.on("change", m2);
  }, [y2, i]), jsxRuntimeExports.jsx("div", {
    ref: P(p2),
    id: "orca-elements-payment-element-" + u2
  });
}
var s = vn;
function w(e, n) {
  return n.then(U$1(e));
}
function Mn(e) {
  var n = e.options, o = e.hyper, t2 = H$1(n), r = reactExports.useState(function() {
    return b;
  }), a2 = r[1], m2 = reactExports.useState(function() {
    return B$1;
  }), l = m2[1];
  return reactExports.useEffect(function() {
    (function(f) {
      return w(function(u2) {
        var i = u2.elements(n), y2 = i.update, p2 = i.getElement, d2 = i.fetchUpdates, c = i.create, x = { options: t2, update: y2, getElement: p2, fetchUpdates: d2, create: c }, N2 = t2.clientSecret, F2 = u2.confirmPayment, g2 = u2.confirmCardPayment, J2 = u2.retrievePaymentIntent, K2 = u2.paymentRequest, V2 = {
          clientSecret: N2,
          confirmPayment: F2,
          confirmCardPayment: g2,
          retrievePaymentIntent: J2,
          paymentRequest: K2
        };
        return a2(function(X2) {
          return V2;
        }), l(function(X2) {
          return x;
        }), Promise.resolve(V2);
      }, f);
    })(o);
  }, []), jsxRuntimeExports.jsx(q.make, { value: r[0], children: jsxRuntimeExports.jsx(G$2.make, { value: m2[0], children: e.children }) });
}
var Oe = Mn;
function Jn(e) {
  return jsxRuntimeExports.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "payment",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick
  });
}
var ie = Jn;
function Hn() {
  return reactExports.useContext(O);
}
function Xn() {
  return console.warn("useElements() is deprecated. Use useWidgets() instead"), reactExports.useContext(S);
}
var zn = Oe, Yn = ie;
function useRequestPaymentMethodChange() {
  const apiUrl = useApiUrl();
  const [clientSecret, setClientSecret] = reactExports.useState();
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const { mutateAsync } = pi();
  const requestPaymentMethodChange = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await mutateAsync({
        url: `${apiUrl}/api/account/subscription/request-payment-method-change`,
        method: "post",
        values: {}
      });
      setClientSecret(data.client_secret);
    } catch (error) {
      console.error("Failed to request payment method change:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutateAsync, apiUrl]);
  return {
    requestPaymentMethodChange,
    clientSecret,
    isLoading
  };
}
function HyperPayment({
  onPaymentSuccess,
  mode = "subscribe"
}) {
  const { subscription, hyperPromise, hyperState } = useSubscriptionContext();
  const [clientSecret, setClientSecret] = reactExports.useState();
  const {
    requestPaymentMethodChange,
    isLoading: isRequestingPaymentMethodChange,
    clientSecret: changePaymentClientSecret
  } = useRequestPaymentMethodChange();
  const paymentRequestChangeMode = reactExports.useRef(false);
  reactExports.useEffect(() => {
    var _a;
    if (mode === "change_payment" && !clientSecret) {
      if (!isRequestingPaymentMethodChange && !paymentRequestChangeMode.current) {
        paymentRequestChangeMode.current = true;
        requestPaymentMethodChange();
      }
      if (changePaymentClientSecret) {
        setClientSecret(changePaymentClientSecret);
      }
    }
    if (mode === "subscribe" && !clientSecret) {
      setClientSecret((_a = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _a.client_secret);
    }
  }, [
    mode,
    clientSecret,
    isRequestingPaymentMethodChange,
    paymentRequestChangeMode.current,
    changePaymentClientSecret,
    requestPaymentMethodChange
  ]);
  if (!hyperState.isHyperLoaded || !clientSecret || mode === "change_payment" && isRequestingPaymentMethodChange) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StyledPaymentSkeleton, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[300px] w-full max-w-md mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    zn,
    {
      options: {
        manual_retry_allowed: true,
        clientSecret
      },
      hyper: hyperPromise,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Yn,
          {
            options: {
              displaySavedPaymentMethods: false,
              displaySavedPaymentMethodsCheckbox: false,
              hideCardNicknameField: true,
              layout: {
                type: "accordion"
              }
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaymentConfirmationButton,
          {
            onPaymentSuccess,
            mode
          }
        )
      ]
    }
  ) });
}
const PaymentConfirmationButton = ({
  onPaymentSuccess,
  mode
}) => {
  const hyper = Hn();
  const elements = Xn();
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [paymentError, setPaymentError] = reactExports.useState(null);
  const handlePayment = async () => {
    var _a;
    if (!hyper || !elements) {
      console.error("Hyper or elements not initialized");
      return;
    }
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const result = await hyper.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href.toString()
        },
        redirect: "if_required"
      });
      if ((result == null ? void 0 : result.status) === "failed" || result.error) {
        setPaymentError(
          ((_a = result.error) == null ? void 0 : _a.message) || "An error occurred during payment"
        );
        console.error("Payment failed:", result.error);
      } else {
        console.log("Payment succeeded:", result);
        onPaymentSuccess(result.payment_method_id);
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred");
      console.error("Error confirming payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick: handlePayment,
        disabled: isProcessing,
        className: "w-full py-2 px-4 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        children: isProcessing ? "Processing..." : mode === "subscribe" ? "Subscribe" : "Update Payment Method"
      }
    ),
    paymentError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-500 mt-2", children: paymentError })
  ] });
};
const StyledPaymentSkeleton = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-center min-h-[300px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6 mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3 mx-auto" })
  ] }) });
};
function useSubmitSubscriptionConnect() {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { mutate, isLoading: isSubmitting } = pi();
  const { refetchSubscription } = useSubscriptionContext();
  const connectPaymentMethod = reactExports.useCallback(
    async (paymentMethodId, onSuccess) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/connect`,
          method: "post",
          values: { payment_method_id: paymentMethodId }
        },
        {
          onSuccess() {
            open == null ? void 0 : open({
              type: "success",
              message: "Payment method connected successfully"
            });
            refetchSubscription == null ? void 0 : refetchSubscription();
            onSuccess();
          },
          onError(error) {
            open == null ? void 0 : open({
              type: "error",
              message: `Failed to connect payment method: ${error.message}`
            });
          }
        }
      );
    },
    [mutate, open, apiUrl]
  );
  return {
    isSubmitting,
    connectPaymentMethod
  };
}
function SubscribePayment() {
  const [showDialog, setShowDialog] = React.useState(true);
  const { selectedPlan } = useSubscriptionContext();
  const { connectPaymentMethod } = useSubmitSubscriptionConnect();
  const handleSuccess = (paymentMethodId) => {
    connectPaymentMethod(paymentMethodId, () => {
      setShowDialog(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Complete Payment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        `Please complete your payment to subscribe to the ${selectedPlan == null ? void 0 : selectedPlan.name} plan.`,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HyperPayment,
          {
            mode: "subscribe",
            onPaymentSuccess: handleSuccess
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Close" }) })
  ] }) });
}
function PricingPlans() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const {
    subscription,
    plans,
    selectedPlan,
    handlePlanSelection,
    isPlanChanging,
    submitPlanChange,
    isLoading
  } = useSubscriptionContext();
  const [showBillingDialog, setShowBillingDialog] = reactExports.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = reactExports.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  const paymentExpired = new Date((_a = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _a.payment_expires) <= /* @__PURE__ */ new Date();
  const planPending = ((_b = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _b.status) === "PENDING";
  const showPayment = !!((_c = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _c.payment_id) && !!((_d = subscription == null ? void 0 : subscription.payment_info) == null ? void 0 : _d.client_secret) && planPending && !paymentExpired && !!((_e = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _e.is_free);
  const isBillingComplete = ((_f = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _f.name) && ((_g = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _g.address) && ((_h = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _h.city) && ((_i = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _i.state) && ((_j = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _j.zip) && ((_k = subscription == null ? void 0 : subscription.billing_info) == null ? void 0 : _k.country);
  const onFreePlan = useOnFreePlan();
  const formatStorage = (storage) => filesize(storage, 0).toUpperCase();
  const formatBandwidth = (bandwidth) => filesize(bandwidth, 0).toUpperCase();
  const handleChoosePlan = (plan) => {
    handlePlanSelection(plan);
    if (!isBillingComplete) {
      setShowBillingDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };
  const handleConfirmPlanChange = async () => {
    setShowConfirmDialog(false);
    if (selectedPlan) {
      await submitPlanChange(selectedPlan);
    }
  };
  reactExports.useEffect(() => {
    if (showPayment) {
      setShowPaymentDialog(true);
    }
  }, [showPayment]);
  reactExports.useEffect(() => {
    if (paymentExpired && planPending) {
      submitPlanChange(subscription == null ? void 0 : subscription.plan);
    }
  }, [paymentExpired, planPending]);
  const getChangeType = (currentPlan, newPlan) => {
    if (onFreePlan) {
      return "Subscribe";
    }
    const currentIndex = plans.findIndex(
      (p2) => p2.identifier === currentPlan.identifier
    );
    const newIndex = plans.findIndex(
      (p2) => p2.identifier === newPlan.identifier
    );
    return newIndex > currentIndex ? "Upgrade" : "Downgrade";
  };
  const renderPlanCard = (plan) => {
    var _a2;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl md:text-3xl lg:text-4xl font-bold", children: plan.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl md:text-5xl lg:text-6xl font-bold", children: [
          "$",
          plan.price,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg md:text-xl lg:text-2xl font-normal text-muted-foreground", children: [
            "/",
            plan.period === "MONTH" ? "month" : "year"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 md:gap-6 lg:gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Storage: ",
            formatStorage(plan.storage)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Upload: ",
            formatBandwidth(plan.upload),
            "/month"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Download: ",
            formatBandwidth(plan.download),
            "/month"
          ] })
        ] }),
        !(subscription == null ? void 0 : subscription.plan) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleChoosePlan(plan), children: "Subscribe" }),
        (subscription == null ? void 0 : subscription.plan) && plan.identifier !== subscription.plan.identifier && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleChoosePlan(plan), children: getChangeType(subscription.plan, plan) }),
        plan.identifier === ((_a2 = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a2.identifier) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary font-semibold text-center", children: planPending ? "Pending Plan" : "Current Plan" })
      ] })
    ] });
  };
  if (isLoading || isPlanChanging) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Carousel, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { children: [...Array(3)].map((_2, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselItem, { className: "md:basis-1/2 lg:basis-1/3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[400px] w-full rounded-lg" }) }, index)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselPrevious, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselNext, {})
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Carousel, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { children: plans.map(
        (plan, index) => {
          var _a2;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            CarouselItem,
            {
              className: cn$1("md:basis-1/2", "lg:basis-1/3", {
                "ring-1 ring-primary": [
                  (_a2 = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a2.identifier,
                  selectedPlan == null ? void 0 : selectedPlan.identifier
                ].includes(plan.identifier)
              }),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 md:p-6 lg:p-8", children: renderPlanCard(plan) })
            },
            index
          );
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselPrevious, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselNext, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showBillingDialog, onOpenChange: setShowBillingDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Complete Billing Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: (subscription == null ? void 0 : subscription.plan) ? "Please complete your billing information before changing your plan." : "Please complete your billing information before subscribing." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { children: "Ok" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showConfirmDialog, onOpenChange: setShowConfirmDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: (subscription == null ? void 0 : subscription.plan) ? "Confirm Plan Change" : "Confirm Subscription" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: (subscription == null ? void 0 : subscription.plan) && selectedPlan ? `Are you sure you want to ${getChangeType(subscription.plan, selectedPlan)} to the ${selectedPlan == null ? void 0 : selectedPlan.name} plan?` : `Are you sure you want to subscribe to the ${selectedPlan == null ? void 0 : selectedPlan.name} plan?` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleConfirmPlanChange, children: "Confirm" })
      ] })
    ] }) }),
    showPaymentDialog && /* @__PURE__ */ jsxRuntimeExports.jsx(SubscribePayment, {})
  ] });
}
function useSubmitSubscriptionCancellation() {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { mutate, isLoading: isSubmitting } = pi();
  const { refetchSubscription } = useSubscriptionContext();
  const cancelSubscription = reactExports.useCallback(
    async (onSuccess) => {
      mutate(
        {
          url: `${apiUrl}/api/account/subscription/cancel`,
          method: "post",
          values: {}
        },
        {
          onSuccess() {
            open == null ? void 0 : open({
              type: "success",
              message: "Subscription cancelled successfully"
            });
            refetchSubscription == null ? void 0 : refetchSubscription();
            onSuccess();
          },
          onError(error) {
            open == null ? void 0 : open({
              type: "error",
              message: `Failed to cancel subscription: ${error.message}`
            });
          }
        }
      );
    },
    [mutate, open, apiUrl]
  );
  return {
    isSubmitting,
    cancelSubscription
  };
}
function SubscriptionHistory() {
  var _a;
  const [showDialog, setShowDialog] = React.useState(false);
  const { subscription } = useSubscriptionContext();
  const { cancelSubscription } = useSubmitSubscriptionCancellation();
  const doAction = () => {
    cancelSubscription(() => {
      setShowDialog(true);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Subscription History" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, {}),
      (subscription == null ? void 0 : subscription.plan) && /* @__PURE__ */ jsxRuntimeExports.jsx(CardFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "w-full",
          onClick: () => setShowDialog(true),
          children: "Cancel Subscription"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Cancel Subscription" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: `Are you sure you want to cancel your subscription to the ${(_a = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a.name} plan?` }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: doAction, children: "Cancel Subscription" })
      ] })
    ] }) })
  ] });
}
function ChangePaymentMethod() {
  const [showDialog, setShowDialog] = React.useState(false);
  const { connectPaymentMethod } = useSubmitSubscriptionConnect();
  const handleSuccess = (paymentMethodId) => {
    setShowDialog(false);
    connectPaymentMethod(paymentMethodId, () => {
      setShowDialog(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Change Payment Method" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "w-full",
          onClick: () => setShowDialog(true),
          children: "Change Payment Method"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showDialog, onOpenChange: setShowDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Change Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          HyperPayment,
          {
            onPaymentSuccess: handleSuccess,
            mode: "change_payment"
          }
        ) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Close" }) })
    ] }) })
  ] });
}
function useBillingInfo() {
  const { subscriptionData, subscriptionIsLoading } = useSubscription();
  return {
    billingInfo: subscriptionData == null ? void 0 : subscriptionData.billing_info,
    isLoading: subscriptionIsLoading
  };
}
function useSubmitBillingInfo() {
  const apiUrl = useApiUrl();
  const { open } = $e$1();
  const { mutate, isLoading: isSubmitting } = pi();
  const { refetchSubscription } = useSubscription();
  const submitBillingInfo = reactExports.useCallback(
    async (billingInfo) => {
      return new Promise((resolve, reject) => {
        mutate(
          {
            url: `${apiUrl}/api/account/subscription/billing`,
            method: "post",
            values: billingInfo,
            errorNotification: false
          },
          {
            onSuccess() {
              open == null ? void 0 : open({
                type: "success",
                message: "Billing info updated successfully"
              });
              refetchSubscription();
              resolve(null);
            },
            onError(error) {
              var _a;
              if (((_a = error.response) == null ? void 0 : _a.status) === 400 && error.response.data) {
                const errorData = error.response.data;
                if (errorData.errors && Array.isArray(errorData.errors)) {
                  const formattedErrors = errorData.errors.reduce((acc, err) => {
                    acc[err.field] = err.message;
                    return acc;
                  }, {});
                  reject(formattedErrors);
                } else {
                  open == null ? void 0 : open({
                    type: "error",
                    message: "Unexpected error format from server"
                  });
                  reject(new Error("Unexpected error format"));
                }
              } else {
                open == null ? void 0 : open({
                  type: "error",
                  message: `Failed to update billing info: ${error.message}`
                });
                reject(error);
              }
            }
          }
        );
      });
    },
    [mutate, open, apiUrl, refetchSubscription]
  );
  return {
    isSubmitting,
    submitBillingInfo
  };
}
const baseSchema = {
  name: z$1.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  country: z$1.string().min(2, "Country must be at least 2 characters").max(56, "Country must not exceed 56 characters")
};
const conditionalFields = {
  address: z$1.string().min(5, "Address must be at least 5 characters").max(200, "Address must not exceed 200 characters"),
  city: z$1.string().min(2, "City must be at least 2 characters").max(100, "City must not exceed 100 characters"),
  state: z$1.string().min(2, "State must be at least 2 characters").max(50, "State must not exceed 50 characters"),
  zip: z$1.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  organization: z$1.union([
    z$1.string().min(2, "Organization must be at least 2 characters"),
    z$1.string().max(100, "Organization must not exceed 100 characters")
  ]).optional().transform((e) => e === "" ? void 0 : e),
  dependentLocality: z$1.string().min(2, "Dependent locality must be at least 2 characters").max(100, "Dependent locality must not exceed 100 characters"),
  sortingCode: z$1.string().min(2, "Sorting code must be at least 2 characters").max(20, "Sorting code must not exceed 20 characters")
};
const fieldMapping = {
  O: "organization",
  A: "address",
  C: "city",
  S: "state",
  Z: "zip",
  D: "dependentLocality",
  X: "sortingCode"
};
const createBillingInfoSchema = (supportedEntities = []) => {
  const schema = { ...baseSchema };
  supportedEntities.forEach((entity) => {
    const field = fieldMapping[entity];
    if (field) {
      schema[field] = conditionalFields[field];
    }
  });
  return z$1.object(schema);
};
var U = 1, Y$1 = 0.9, H = 0.8, J = 0.17, p = 0.1, u = 0.999, $ = 0.9999;
var k$1 = 0.99, m = /[\\\/_+.#"@\[\(\{&]/, B = /[\\\/_+.#"@\[\(\{&]/g, K = /[\s-]/, X$1 = /[\s-]/g;
function G$1(_2, C, h, P2, A2, f, O2) {
  if (f === C.length) return A2 === _2.length ? U : k$1;
  var T2 = `${A2},${f}`;
  if (O2[T2] !== void 0) return O2[T2];
  for (var L2 = P2.charAt(f), c = h.indexOf(L2, A2), S2 = 0, E2, N2, R2, M2; c >= 0; ) E2 = G$1(_2, C, h, P2, c + 1, f + 1, O2), E2 > S2 && (c === A2 ? E2 *= U : m.test(_2.charAt(c - 1)) ? (E2 *= H, R2 = _2.slice(A2, c - 1).match(B), R2 && A2 > 0 && (E2 *= Math.pow(u, R2.length))) : K.test(_2.charAt(c - 1)) ? (E2 *= Y$1, M2 = _2.slice(A2, c - 1).match(X$1), M2 && A2 > 0 && (E2 *= Math.pow(u, M2.length))) : (E2 *= J, A2 > 0 && (E2 *= Math.pow(u, c - A2))), _2.charAt(c) !== C.charAt(f) && (E2 *= $)), (E2 < p && h.charAt(c - 1) === P2.charAt(f + 1) || P2.charAt(f + 1) === P2.charAt(f) && h.charAt(c - 1) !== P2.charAt(f)) && (N2 = G$1(_2, C, h, P2, c + 1, f + 2, O2), N2 * p > E2 && (E2 = N2 * p)), E2 > S2 && (S2 = E2), c = h.indexOf(L2, c + 1);
  return O2[T2] = S2, S2;
}
function D$1(_2) {
  return _2.toLowerCase().replace(X$1, " ");
}
function W(_2, C, h) {
  return _2 = h && h.length > 0 ? `${_2 + " " + h.join(" ")}` : _2, G$1(_2, C, D$1(_2), D$1(C), 0, 0, {});
}
function $e42e1063c40fb3ef$export$b9ecd428b558ff10(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler === null || originalEventHandler === void 0 || originalEventHandler(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) return ourEventHandler === null || ourEventHandler === void 0 ? void 0 : ourEventHandler(event);
  };
}
function $6ed0406888f73fc4$var$setRef(ref, value) {
  if (typeof ref === "function") ref(value);
  else if (ref !== null && ref !== void 0) ref.current = value;
}
function $6ed0406888f73fc4$export$43e446d32b3d21af(...refs) {
  return (node) => refs.forEach(
    (ref) => $6ed0406888f73fc4$var$setRef(ref, node)
  );
}
function $6ed0406888f73fc4$export$c7b2cbe3552a0d05(...refs) {
  return reactExports.useCallback($6ed0406888f73fc4$export$43e446d32b3d21af(...refs), refs);
}
function $c512c27ab02ef895$export$50c7b4e9d9f19c1(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function $c512c27ab02ef895$export$fd42f52fd3ae1109(rootComponentName, defaultContext) {
    const BaseContext = /* @__PURE__ */ reactExports.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [
      ...defaultContexts,
      defaultContext
    ];
    function Provider(props) {
      const { scope, children, ...context } = props;
      const Context = (scope === null || scope === void 0 ? void 0 : scope[scopeName][index]) || BaseContext;
      const value = reactExports.useMemo(
        () => context,
        Object.values(context)
      );
      return /* @__PURE__ */ reactExports.createElement(Context.Provider, {
        value
      }, children);
    }
    function useContext(consumerName, scope) {
      const Context = (scope === null || scope === void 0 ? void 0 : scope[scopeName][index]) || BaseContext;
      const context = reactExports.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    Provider.displayName = rootComponentName + "Provider";
    return [
      Provider,
      useContext
    ];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return /* @__PURE__ */ reactExports.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = (scope === null || scope === void 0 ? void 0 : scope[scopeName]) || scopeContexts;
      return reactExports.useMemo(
        () => ({
          [`__scope${scopeName}`]: {
            ...scope,
            [scopeName]: contexts
          }
        }),
        [
          scope,
          contexts
        ]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [
    $c512c27ab02ef895$export$fd42f52fd3ae1109,
    $c512c27ab02ef895$var$composeContextScopes(createScope, ...createContextScopeDeps)
  ];
}
function $c512c27ab02ef895$var$composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope1 = () => {
    const scopeHooks = scopes.map(
      (createScope) => ({
        useScope: createScope(),
        scopeName: createScope.scopeName
      })
    );
    return function useComposedScopes(overrideScopes) {
      const nextScopes1 = scopeHooks.reduce((nextScopes, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return {
          ...nextScopes,
          ...currentScope
        };
      }, {});
      return reactExports.useMemo(
        () => ({
          [`__scope${baseScope.scopeName}`]: nextScopes1
        }),
        [
          nextScopes1
        ]
      );
    };
  };
  createScope1.scopeName = baseScope.scopeName;
  return createScope1;
}
const $9f79659886946c16$export$e5c5a5f917a5871c = Boolean(globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) ? reactExports.useLayoutEffect : () => {
};
const $1746a345f3d73bb7$var$useReactId = $2AODx$react["useId".toString()] || (() => void 0);
let $1746a345f3d73bb7$var$count = 0;
function $1746a345f3d73bb7$export$f680877a34711e37(deterministicId) {
  const [id, setId] = reactExports.useState($1746a345f3d73bb7$var$useReactId());
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    if (!deterministicId) setId(
      (reactId) => reactId !== null && reactId !== void 0 ? reactId : String($1746a345f3d73bb7$var$count++)
    );
  }, [
    deterministicId
  ]);
  return deterministicId || (id ? `radix-${id}` : "");
}
function $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(callback) {
  const callbackRef = reactExports.useRef(callback);
  reactExports.useEffect(() => {
    callbackRef.current = callback;
  });
  return reactExports.useMemo(
    () => (...args) => {
      var _callbackRef$current;
      return (_callbackRef$current = callbackRef.current) === null || _callbackRef$current === void 0 ? void 0 : _callbackRef$current.call(callbackRef, ...args);
    },
    []
  );
}
function $71cd76cc60e0454e$export$6f32135080cb4c3({ prop, defaultProp, onChange = () => {
} }) {
  const [uncontrolledProp, setUncontrolledProp] = $71cd76cc60e0454e$var$useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value1 = isControlled ? prop : uncontrolledProp;
  const handleChange = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onChange);
  const setValue = reactExports.useCallback((nextValue) => {
    if (isControlled) {
      const setter = nextValue;
      const value = typeof nextValue === "function" ? setter(prop) : nextValue;
      if (value !== prop) handleChange(value);
    } else setUncontrolledProp(nextValue);
  }, [
    isControlled,
    prop,
    setUncontrolledProp,
    handleChange
  ]);
  return [
    value1,
    setValue
  ];
}
function $71cd76cc60e0454e$var$useUncontrolledState({ defaultProp, onChange }) {
  const uncontrolledState = reactExports.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = reactExports.useRef(value);
  const handleChange = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onChange);
  reactExports.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [
    value,
    prevValueRef,
    handleChange
  ]);
  return uncontrolledState;
}
const $5e63c961fc1ce211$export$8c6ed5c666ac1360 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = reactExports.Children.toArray(children);
  const slottable = childrenArray.find($5e63c961fc1ce211$var$isSlottable);
  if (slottable) {
    const newElement = slottable.props.children;
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (reactExports.Children.count(newElement) > 1) return reactExports.Children.only(null);
        return /* @__PURE__ */ reactExports.isValidElement(newElement) ? newElement.props.children : null;
      } else return child;
    });
    return /* @__PURE__ */ reactExports.createElement($5e63c961fc1ce211$var$SlotClone, _extends({}, slotProps, {
      ref: forwardedRef
    }), /* @__PURE__ */ reactExports.isValidElement(newElement) ? /* @__PURE__ */ reactExports.cloneElement(newElement, void 0, newChildren) : null);
  }
  return /* @__PURE__ */ reactExports.createElement($5e63c961fc1ce211$var$SlotClone, _extends({}, slotProps, {
    ref: forwardedRef
  }), children);
});
$5e63c961fc1ce211$export$8c6ed5c666ac1360.displayName = "Slot";
const $5e63c961fc1ce211$var$SlotClone = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  if (/* @__PURE__ */ reactExports.isValidElement(children)) return /* @__PURE__ */ reactExports.cloneElement(children, {
    ...$5e63c961fc1ce211$var$mergeProps(slotProps, children.props),
    ref: forwardedRef ? $6ed0406888f73fc4$export$43e446d32b3d21af(forwardedRef, children.ref) : children.ref
  });
  return reactExports.Children.count(children) > 1 ? reactExports.Children.only(null) : null;
});
$5e63c961fc1ce211$var$SlotClone.displayName = "SlotClone";
const $5e63c961fc1ce211$export$d9f1ccf0bdb05d45 = ({ children }) => {
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, children);
};
function $5e63c961fc1ce211$var$isSlottable(child) {
  return /* @__PURE__ */ reactExports.isValidElement(child) && child.type === $5e63c961fc1ce211$export$d9f1ccf0bdb05d45;
}
function $5e63c961fc1ce211$var$mergeProps(slotProps, childProps) {
  const overrideProps = {
    ...childProps
  };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) overrideProps[propName] = (...args) => {
        childPropValue(...args);
        slotPropValue(...args);
      };
      else if (slotPropValue) overrideProps[propName] = slotPropValue;
    } else if (propName === "style") overrideProps[propName] = {
      ...slotPropValue,
      ...childPropValue
    };
    else if (propName === "className") overrideProps[propName] = [
      slotPropValue,
      childPropValue
    ].filter(Boolean).join(" ");
  }
  return {
    ...slotProps,
    ...overrideProps
  };
}
const $8927f6f2acc4f386$var$NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
const $8927f6f2acc4f386$export$250ffa63cdc0d034 = $8927f6f2acc4f386$var$NODES.reduce((primitive, node) => {
  const Node = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? $5e63c961fc1ce211$export$8c6ed5c666ac1360 : node;
    reactExports.useEffect(() => {
      window[Symbol.for("radix-ui")] = true;
    }, []);
    return /* @__PURE__ */ reactExports.createElement(Comp, _extends({}, primitiveProps, {
      ref: forwardedRef
    }));
  });
  Node.displayName = `Primitive.${node}`;
  return {
    ...primitive,
    [node]: Node
  };
}, {});
function $8927f6f2acc4f386$export$6d1a0317bde7de7f(target, event) {
  if (target) reactDomExports.flushSync(
    () => target.dispatchEvent(event)
  );
}
function $addc16e1bbe58fd0$export$3a72a57244d6e765(onEscapeKeyDownProp, ownerDocument = globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) {
  const onEscapeKeyDown = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onEscapeKeyDownProp);
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onEscapeKeyDown(event);
    };
    ownerDocument.addEventListener("keydown", handleKeyDown);
    return () => ownerDocument.removeEventListener("keydown", handleKeyDown);
  }, [
    onEscapeKeyDown,
    ownerDocument
  ]);
}
const $5cb92bef7577960e$var$CONTEXT_UPDATE = "dismissableLayer.update";
const $5cb92bef7577960e$var$POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
const $5cb92bef7577960e$var$FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
let $5cb92bef7577960e$var$originalBodyPointerEvents;
const $5cb92bef7577960e$var$DismissableLayerContext = /* @__PURE__ */ reactExports.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
});
const $5cb92bef7577960e$export$177fb62ff3ec1f22 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  var _node$ownerDocument;
  const { disableOutsidePointerEvents = false, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, onInteractOutside, onDismiss, ...layerProps } = props;
  const context = reactExports.useContext($5cb92bef7577960e$var$DismissableLayerContext);
  const [node1, setNode] = reactExports.useState(null);
  const ownerDocument = (_node$ownerDocument = node1 === null || node1 === void 0 ? void 0 : node1.ownerDocument) !== null && _node$ownerDocument !== void 0 ? _node$ownerDocument : globalThis === null || globalThis === void 0 ? void 0 : globalThis.document;
  const [, force] = reactExports.useState({});
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(
    forwardedRef,
    (node) => setNode(node)
  );
  const layers = Array.from(context.layers);
  const [highestLayerWithOutsidePointerEventsDisabled] = [
    ...context.layersWithOutsidePointerEventsDisabled
  ].slice(-1);
  const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
  const index = node1 ? layers.indexOf(node1) : -1;
  const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
  const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
  const pointerDownOutside = $5cb92bef7577960e$var$usePointerDownOutside((event) => {
    const target = event.target;
    const isPointerDownOnBranch = [
      ...context.branches
    ].some(
      (branch) => branch.contains(target)
    );
    if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
    onPointerDownOutside === null || onPointerDownOutside === void 0 || onPointerDownOutside(event);
    onInteractOutside === null || onInteractOutside === void 0 || onInteractOutside(event);
    if (!event.defaultPrevented) onDismiss === null || onDismiss === void 0 || onDismiss();
  }, ownerDocument);
  const focusOutside = $5cb92bef7577960e$var$useFocusOutside((event) => {
    const target = event.target;
    const isFocusInBranch = [
      ...context.branches
    ].some(
      (branch) => branch.contains(target)
    );
    if (isFocusInBranch) return;
    onFocusOutside === null || onFocusOutside === void 0 || onFocusOutside(event);
    onInteractOutside === null || onInteractOutside === void 0 || onInteractOutside(event);
    if (!event.defaultPrevented) onDismiss === null || onDismiss === void 0 || onDismiss();
  }, ownerDocument);
  $addc16e1bbe58fd0$export$3a72a57244d6e765((event) => {
    const isHighestLayer = index === context.layers.size - 1;
    if (!isHighestLayer) return;
    onEscapeKeyDown === null || onEscapeKeyDown === void 0 || onEscapeKeyDown(event);
    if (!event.defaultPrevented && onDismiss) {
      event.preventDefault();
      onDismiss();
    }
  }, ownerDocument);
  reactExports.useEffect(() => {
    if (!node1) return;
    if (disableOutsidePointerEvents) {
      if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
        $5cb92bef7577960e$var$originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
        ownerDocument.body.style.pointerEvents = "none";
      }
      context.layersWithOutsidePointerEventsDisabled.add(node1);
    }
    context.layers.add(node1);
    $5cb92bef7577960e$var$dispatchUpdate();
    return () => {
      if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) ownerDocument.body.style.pointerEvents = $5cb92bef7577960e$var$originalBodyPointerEvents;
    };
  }, [
    node1,
    ownerDocument,
    disableOutsidePointerEvents,
    context
  ]);
  reactExports.useEffect(() => {
    return () => {
      if (!node1) return;
      context.layers.delete(node1);
      context.layersWithOutsidePointerEventsDisabled.delete(node1);
      $5cb92bef7577960e$var$dispatchUpdate();
    };
  }, [
    node1,
    context
  ]);
  reactExports.useEffect(() => {
    const handleUpdate = () => force({});
    document.addEventListener($5cb92bef7577960e$var$CONTEXT_UPDATE, handleUpdate);
    return () => document.removeEventListener($5cb92bef7577960e$var$CONTEXT_UPDATE, handleUpdate);
  }, []);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, layerProps, {
    ref: composedRefs,
    style: {
      pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
      ...props.style
    },
    onFocusCapture: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onFocusCapture, focusOutside.onFocusCapture),
    onBlurCapture: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onBlurCapture, focusOutside.onBlurCapture),
    onPointerDownCapture: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerDownCapture, pointerDownOutside.onPointerDownCapture)
  }));
});
function $5cb92bef7577960e$var$usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) {
  const handlePointerDownOutside = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onPointerDownOutside);
  const isPointerInsideReactTreeRef = reactExports.useRef(false);
  const handleClickRef = reactExports.useRef(() => {
  });
  reactExports.useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent = function() {
          $5cb92bef7577960e$var$handleAndDispatchCustomEvent($5cb92bef7577960e$var$POINTER_DOWN_OUTSIDE, handlePointerDownOutside, eventDetail, {
            discrete: true
          });
        };
        const eventDetail = {
          originalEvent: event
        };
        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent;
          ownerDocument.addEventListener("click", handleClickRef.current, {
            once: true
          });
        } else handleAndDispatchPointerDownOutsideEvent();
      } else
        ownerDocument.removeEventListener("click", handleClickRef.current);
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [
    ownerDocument,
    handlePointerDownOutside
  ]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
  };
}
function $5cb92bef7577960e$var$useFocusOutside(onFocusOutside, ownerDocument = globalThis === null || globalThis === void 0 ? void 0 : globalThis.document) {
  const handleFocusOutside = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onFocusOutside);
  const isFocusInsideReactTreeRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const handleFocus = (event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = {
          originalEvent: event
        };
        $5cb92bef7577960e$var$handleAndDispatchCustomEvent($5cb92bef7577960e$var$FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [
    ownerDocument,
    handleFocusOutside
  ]);
  return {
    onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
    onBlurCapture: () => isFocusInsideReactTreeRef.current = false
  };
}
function $5cb92bef7577960e$var$dispatchUpdate() {
  const event = new CustomEvent($5cb92bef7577960e$var$CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
function $5cb92bef7577960e$var$handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail
  });
  if (handler) target.addEventListener(name, handler, {
    once: true
  });
  if (discrete) $8927f6f2acc4f386$export$6d1a0317bde7de7f(target, event);
  else target.dispatchEvent(event);
}
const $d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
const $d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
const $d3863c46a17e8a28$var$EVENT_OPTIONS = {
  bubbles: false,
  cancelable: true
};
const $d3863c46a17e8a28$export$20e40289641fbbb6 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { loop = false, trapped = false, onMountAutoFocus: onMountAutoFocusProp, onUnmountAutoFocus: onUnmountAutoFocusProp, ...scopeProps } = props;
  const [container1, setContainer] = reactExports.useState(null);
  const onMountAutoFocus = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onMountAutoFocusProp);
  const onUnmountAutoFocus = $b1b2314f5f9a1d84$export$25bec8c6f54ee79a(onUnmountAutoFocusProp);
  const lastFocusedElementRef = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(
    forwardedRef,
    (node) => setContainer(node)
  );
  const focusScope = reactExports.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  reactExports.useEffect(() => {
    if (trapped) {
      let handleFocusIn = function(event) {
        if (focusScope.paused || !container1) return;
        const target = event.target;
        if (container1.contains(target)) lastFocusedElementRef.current = target;
        else $d3863c46a17e8a28$var$focus(lastFocusedElementRef.current, {
          select: true
        });
      }, handleFocusOut = function(event) {
        if (focusScope.paused || !container1) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container1.contains(relatedTarget)) $d3863c46a17e8a28$var$focus(lastFocusedElementRef.current, {
          select: true
        });
      }, handleMutations = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) if (mutation.removedNodes.length > 0) $d3863c46a17e8a28$var$focus(container1);
      };
      document.addEventListener("focusin", handleFocusIn);
      document.addEventListener("focusout", handleFocusOut);
      const mutationObserver = new MutationObserver(handleMutations);
      if (container1) mutationObserver.observe(container1, {
        childList: true,
        subtree: true
      });
      return () => {
        document.removeEventListener("focusin", handleFocusIn);
        document.removeEventListener("focusout", handleFocusOut);
        mutationObserver.disconnect();
      };
    }
  }, [
    trapped,
    container1,
    focusScope.paused
  ]);
  reactExports.useEffect(() => {
    if (container1) {
      $d3863c46a17e8a28$var$focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container1.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent($d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT, $d3863c46a17e8a28$var$EVENT_OPTIONS);
        container1.addEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container1.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          $d3863c46a17e8a28$var$focusFirst($d3863c46a17e8a28$var$removeLinks($d3863c46a17e8a28$var$getTabbableCandidates(container1)), {
            select: true
          });
          if (document.activeElement === previouslyFocusedElement) $d3863c46a17e8a28$var$focus(container1);
        }
      }
      return () => {
        container1.removeEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent($d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT, $d3863c46a17e8a28$var$EVENT_OPTIONS);
          container1.addEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container1.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) $d3863c46a17e8a28$var$focus(previouslyFocusedElement !== null && previouslyFocusedElement !== void 0 ? previouslyFocusedElement : document.body, {
            select: true
          });
          container1.removeEventListener($d3863c46a17e8a28$var$AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          $d3863c46a17e8a28$var$focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [
    container1,
    onMountAutoFocus,
    onUnmountAutoFocus,
    focusScope
  ]);
  const handleKeyDown = reactExports.useCallback((event) => {
    if (!loop && !trapped) return;
    if (focusScope.paused) return;
    const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
    const focusedElement = document.activeElement;
    if (isTabKey && focusedElement) {
      const container = event.currentTarget;
      const [first, last] = $d3863c46a17e8a28$var$getTabbableEdges(container);
      const hasTabbableElementsInside = first && last;
      if (!hasTabbableElementsInside) {
        if (focusedElement === container) event.preventDefault();
      } else {
        if (!event.shiftKey && focusedElement === last) {
          event.preventDefault();
          if (loop) $d3863c46a17e8a28$var$focus(first, {
            select: true
          });
        } else if (event.shiftKey && focusedElement === first) {
          event.preventDefault();
          if (loop) $d3863c46a17e8a28$var$focus(last, {
            select: true
          });
        }
      }
    }
  }, [
    loop,
    trapped,
    focusScope.paused
  ]);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
    tabIndex: -1
  }, scopeProps, {
    ref: composedRefs,
    onKeyDown: handleKeyDown
  }));
});
function $d3863c46a17e8a28$var$focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    $d3863c46a17e8a28$var$focus(candidate, {
      select
    });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function $d3863c46a17e8a28$var$getTabbableEdges(container) {
  const candidates = $d3863c46a17e8a28$var$getTabbableCandidates(container);
  const first = $d3863c46a17e8a28$var$findVisible(candidates, container);
  const last = $d3863c46a17e8a28$var$findVisible(candidates.reverse(), container);
  return [
    first,
    last
  ];
}
function $d3863c46a17e8a28$var$getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function $d3863c46a17e8a28$var$findVisible(elements, container) {
  for (const element of elements) {
    if (!$d3863c46a17e8a28$var$isHidden(element, {
      upTo: container
    })) return element;
  }
}
function $d3863c46a17e8a28$var$isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function $d3863c46a17e8a28$var$isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function $d3863c46a17e8a28$var$focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({
      preventScroll: true
    });
    if (element !== previouslyFocusedElement && $d3863c46a17e8a28$var$isSelectableInput(element) && select) element.select();
  }
}
const $d3863c46a17e8a28$var$focusScopesStack = $d3863c46a17e8a28$var$createFocusScopesStack();
function $d3863c46a17e8a28$var$createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) activeFocusScope === null || activeFocusScope === void 0 || activeFocusScope.pause();
      stack = $d3863c46a17e8a28$var$arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      var _stack$;
      stack = $d3863c46a17e8a28$var$arrayRemove(stack, focusScope);
      (_stack$ = stack[0]) === null || _stack$ === void 0 || _stack$.resume();
    }
  };
}
function $d3863c46a17e8a28$var$arrayRemove(array, item) {
  const updatedArray = [
    ...array
  ];
  const index = updatedArray.indexOf(item);
  if (index !== -1) updatedArray.splice(index, 1);
  return updatedArray;
}
function $d3863c46a17e8a28$var$removeLinks(items) {
  return items.filter(
    (item) => item.tagName !== "A"
  );
}
const $f1701beae083dbae$export$602eac185826482c = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  var _globalThis$document;
  const { container = globalThis === null || globalThis === void 0 ? void 0 : (_globalThis$document = globalThis.document) === null || _globalThis$document === void 0 ? void 0 : _globalThis$document.body, ...portalProps } = props;
  return container ? /* @__PURE__ */ $7SXl2$reactdom.createPortal(/* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({}, portalProps, {
    ref: forwardedRef
  })), container) : null;
});
function $fe963b355347cc68$export$3e6543de14f8614f(initialState, machine) {
  return reactExports.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState !== null && nextState !== void 0 ? nextState : state;
  }, initialState);
}
const $921a889cee6df7e8$export$99c2b779aa4e8b8b = (props) => {
  const { present, children } = props;
  const presence = $921a889cee6df7e8$var$usePresence(present);
  const child = typeof children === "function" ? children({
    present: presence.isPresent
  }) : reactExports.Children.only(children);
  const ref = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(presence.ref, child.ref);
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? /* @__PURE__ */ reactExports.cloneElement(child, {
    ref
  }) : null;
};
$921a889cee6df7e8$export$99c2b779aa4e8b8b.displayName = "Presence";
function $921a889cee6df7e8$var$usePresence(present) {
  const [node1, setNode] = reactExports.useState();
  const stylesRef = reactExports.useRef({});
  const prevPresentRef = reactExports.useRef(present);
  const prevAnimationNameRef = reactExports.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = $fe963b355347cc68$export$3e6543de14f8614f(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  reactExports.useEffect(() => {
    const currentAnimationName = $921a889cee6df7e8$var$getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [
    state
  ]);
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = $921a889cee6df7e8$var$getAnimationName(styles);
      if (present) send("MOUNT");
      else if (currentAnimationName === "none" || (styles === null || styles === void 0 ? void 0 : styles.display) === "none")
        send("UNMOUNT");
      else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) send("ANIMATION_OUT");
        else send("UNMOUNT");
      }
      prevPresentRef.current = present;
    }
  }, [
    present,
    send
  ]);
  $9f79659886946c16$export$e5c5a5f917a5871c(() => {
    if (node1) {
      const handleAnimationEnd = (event) => {
        const currentAnimationName = $921a889cee6df7e8$var$getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node1 && isCurrentAnimation)
          reactDomExports.flushSync(
            () => send("ANIMATION_END")
          );
      };
      const handleAnimationStart = (event) => {
        if (event.target === node1)
          prevAnimationNameRef.current = $921a889cee6df7e8$var$getAnimationName(stylesRef.current);
      };
      node1.addEventListener("animationstart", handleAnimationStart);
      node1.addEventListener("animationcancel", handleAnimationEnd);
      node1.addEventListener("animationend", handleAnimationEnd);
      return () => {
        node1.removeEventListener("animationstart", handleAnimationStart);
        node1.removeEventListener("animationcancel", handleAnimationEnd);
        node1.removeEventListener("animationend", handleAnimationEnd);
      };
    } else
      send("ANIMATION_END");
  }, [
    node1,
    send
  ]);
  return {
    isPresent: [
      "mounted",
      "unmountSuspended"
    ].includes(state),
    ref: reactExports.useCallback((node) => {
      if (node) stylesRef.current = getComputedStyle(node);
      setNode(node);
    }, [])
  };
}
function $921a889cee6df7e8$var$getAnimationName(styles) {
  return (styles === null || styles === void 0 ? void 0 : styles.animationName) || "none";
}
let $3db38b7d1fb3fe6a$var$count = 0;
function $3db38b7d1fb3fe6a$export$b7ece24a22aeda8c() {
  reactExports.useEffect(() => {
    var _edgeGuards$, _edgeGuards$2;
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", (_edgeGuards$ = edgeGuards[0]) !== null && _edgeGuards$ !== void 0 ? _edgeGuards$ : $3db38b7d1fb3fe6a$var$createFocusGuard());
    document.body.insertAdjacentElement("beforeend", (_edgeGuards$2 = edgeGuards[1]) !== null && _edgeGuards$2 !== void 0 ? _edgeGuards$2 : $3db38b7d1fb3fe6a$var$createFocusGuard());
    $3db38b7d1fb3fe6a$var$count++;
    return () => {
      if ($3db38b7d1fb3fe6a$var$count === 1) document.querySelectorAll("[data-radix-focus-guard]").forEach(
        (node) => node.remove()
      );
      $3db38b7d1fb3fe6a$var$count--;
    };
  }, []);
}
function $3db38b7d1fb3fe6a$var$createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.cssText = "outline: none; opacity: 0; position: fixed; pointer-events: none";
  return element;
}
var effectCar = createSidecarMedium();
var nothing = function() {
  return;
};
var RemoveScroll = reactExports.forwardRef(function(props, parentRef) {
  var ref = reactExports.useRef(null);
  var _a = reactExports.useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noIsolation", "inert", "allowPinchZoom", "as"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    enabled && reactExports.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref }),
    forwardProps ? reactExports.cloneElement(reactExports.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : reactExports.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    var options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var nonPassive = passiveSupported ? { passive: false } : false;
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables(axis, current), s2 = _a[1], d2 = _a[2];
      if (s2 > d2) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== document.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    target = target.parentNode;
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (availableScroll === 0 || !noOverscroll)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (availableScrollTop === 0 || !noOverscroll)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x, y2) {
  return x[0] === y2[0] && x[1] === y2[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = reactExports.useRef([]);
  var touchStartRef = reactExports.useRef([0, 0]);
  var activeAxis = reactExports.useRef();
  var id = reactExports.useState(idCounter++)[0];
  var Style = reactExports.useState(function() {
    return styleSingleton();
  })[0];
  var lastProps = reactExports.useRef(props);
  reactExports.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  reactExports.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = reactExports.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
  }, []);
  var shouldPrevent = reactExports.useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e) {
      return e.name === event.type && e.target === event.target && deltaCompare(e.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = reactExports.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
        return e !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = reactExports.useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  reactExports.useEffect(function() {
    lockStack.push(Style);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    inert ? reactExports.createElement(Style, { styles: generateStyle(id) }) : null,
    removeScrollBar ? reactExports.createElement(RemoveScrollBar, { gapMode: "margin" }) : null
  );
}
const SideCar = exportSidecar(effectCar, RemoveScrollSideCar);
var ReactRemoveScroll = reactExports.forwardRef(function(props, ref) {
  return reactExports.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: SideCar }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
const $5d3850c4d0b4e6c7$var$DIALOG_NAME = "Dialog";
const [$5d3850c4d0b4e6c7$var$createDialogContext, $5d3850c4d0b4e6c7$export$cc702773b8ea3e41] = $c512c27ab02ef895$export$50c7b4e9d9f19c1($5d3850c4d0b4e6c7$var$DIALOG_NAME);
const [$5d3850c4d0b4e6c7$var$DialogProvider, $5d3850c4d0b4e6c7$var$useDialogContext] = $5d3850c4d0b4e6c7$var$createDialogContext($5d3850c4d0b4e6c7$var$DIALOG_NAME);
const $5d3850c4d0b4e6c7$export$3ddf2d174ce01153 = (props) => {
  const { __scopeDialog, children, open: openProp, defaultOpen, onOpenChange, modal = true } = props;
  const triggerRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [open = false, setOpen] = $71cd76cc60e0454e$export$6f32135080cb4c3({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogProvider, {
    scope: __scopeDialog,
    triggerRef,
    contentRef,
    contentId: $1746a345f3d73bb7$export$f680877a34711e37(),
    titleId: $1746a345f3d73bb7$export$f680877a34711e37(),
    descriptionId: $1746a345f3d73bb7$export$f680877a34711e37(),
    open,
    onOpenChange: setOpen,
    onOpenToggle: reactExports.useCallback(
      () => setOpen(
        (prevOpen) => !prevOpen
      ),
      [
        setOpen
      ]
    ),
    modal
  }, children);
};
const $5d3850c4d0b4e6c7$var$PORTAL_NAME = "DialogPortal";
const [$5d3850c4d0b4e6c7$var$PortalProvider, $5d3850c4d0b4e6c7$var$usePortalContext] = $5d3850c4d0b4e6c7$var$createDialogContext($5d3850c4d0b4e6c7$var$PORTAL_NAME, {
  forceMount: void 0
});
const $5d3850c4d0b4e6c7$export$dad7c95542bacce0 = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$PortalProvider, {
    scope: __scopeDialog,
    forceMount
  }, reactExports.Children.map(
    children,
    (child) => /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
      present: forceMount || context.open
    }, /* @__PURE__ */ reactExports.createElement($f1701beae083dbae$export$602eac185826482c, {
      asChild: true,
      container
    }, child))
  ));
};
const $5d3850c4d0b4e6c7$var$OVERLAY_NAME = "DialogOverlay";
const $5d3850c4d0b4e6c7$export$bd1d06c79be19e17 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const portalContext = $5d3850c4d0b4e6c7$var$usePortalContext($5d3850c4d0b4e6c7$var$OVERLAY_NAME, props.__scopeDialog);
  const { forceMount = portalContext.forceMount, ...overlayProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$OVERLAY_NAME, props.__scopeDialog);
  return context.modal ? /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
    present: forceMount || context.open
  }, /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogOverlayImpl, _extends({}, overlayProps, {
    ref: forwardedRef
  }))) : null;
});
const $5d3850c4d0b4e6c7$var$DialogOverlayImpl = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...overlayProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$OVERLAY_NAME, __scopeDialog);
  return (
    // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
    // ie. when `Overlay` and `Content` are siblings
    /* @__PURE__ */ reactExports.createElement(ReactRemoveScroll, {
      as: $5e63c961fc1ce211$export$8c6ed5c666ac1360,
      allowPinchZoom: true,
      shards: [
        context.contentRef
      ]
    }, /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, _extends({
      "data-state": $5d3850c4d0b4e6c7$var$getState(context.open)
    }, overlayProps, {
      ref: forwardedRef,
      style: {
        pointerEvents: "auto",
        ...overlayProps.style
      }
    })))
  );
});
const $5d3850c4d0b4e6c7$var$CONTENT_NAME = "DialogContent";
const $5d3850c4d0b4e6c7$export$b6d9565de1e068cf = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const portalContext = $5d3850c4d0b4e6c7$var$usePortalContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  const { forceMount = portalContext.forceMount, ...contentProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($921a889cee6df7e8$export$99c2b779aa4e8b8b, {
    present: forceMount || context.open
  }, context.modal ? /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentModal, _extends({}, contentProps, {
    ref: forwardedRef
  })) : /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentNonModal, _extends({}, contentProps, {
    ref: forwardedRef
  })));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$b6d9565de1e068cf, {
  displayName: $5d3850c4d0b4e6c7$var$CONTENT_NAME
});
const $5d3850c4d0b4e6c7$var$DialogContentModal = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  const contentRef = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, context.contentRef, contentRef);
  reactExports.useEffect(() => {
    const content = contentRef.current;
    if (content) return hideOthers(content);
  }, []);
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentImpl, _extends({}, props, {
    ref: composedRefs,
    trapFocus: context.open,
    disableOutsidePointerEvents: true,
    onCloseAutoFocus: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onCloseAutoFocus, (event) => {
      var _context$triggerRef$c;
      event.preventDefault();
      (_context$triggerRef$c = context.triggerRef.current) === null || _context$triggerRef$c === void 0 || _context$triggerRef$c.focus();
    }),
    onPointerDownOutside: $e42e1063c40fb3ef$export$b9ecd428b558ff10(props.onPointerDownOutside, (event) => {
      const originalEvent = event.detail.originalEvent;
      const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
      const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
      if (isRightClick) event.preventDefault();
    }),
    onFocusOutside: $e42e1063c40fb3ef$export$b9ecd428b558ff10(
      props.onFocusOutside,
      (event) => event.preventDefault()
    )
  }));
});
const $5d3850c4d0b4e6c7$var$DialogContentNonModal = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, props.__scopeDialog);
  const hasInteractedOutsideRef = reactExports.useRef(false);
  const hasPointerDownOutsideRef = reactExports.useRef(false);
  return /* @__PURE__ */ reactExports.createElement($5d3850c4d0b4e6c7$var$DialogContentImpl, _extends({}, props, {
    ref: forwardedRef,
    trapFocus: false,
    disableOutsidePointerEvents: false,
    onCloseAutoFocus: (event) => {
      var _props$onCloseAutoFoc;
      (_props$onCloseAutoFoc = props.onCloseAutoFocus) === null || _props$onCloseAutoFoc === void 0 || _props$onCloseAutoFoc.call(props, event);
      if (!event.defaultPrevented) {
        var _context$triggerRef$c2;
        if (!hasInteractedOutsideRef.current) (_context$triggerRef$c2 = context.triggerRef.current) === null || _context$triggerRef$c2 === void 0 || _context$triggerRef$c2.focus();
        event.preventDefault();
      }
      hasInteractedOutsideRef.current = false;
      hasPointerDownOutsideRef.current = false;
    },
    onInteractOutside: (event) => {
      var _props$onInteractOuts, _context$triggerRef$c3;
      (_props$onInteractOuts = props.onInteractOutside) === null || _props$onInteractOuts === void 0 || _props$onInteractOuts.call(props, event);
      if (!event.defaultPrevented) {
        hasInteractedOutsideRef.current = true;
        if (event.detail.originalEvent.type === "pointerdown") hasPointerDownOutsideRef.current = true;
      }
      const target = event.target;
      const targetIsTrigger = (_context$triggerRef$c3 = context.triggerRef.current) === null || _context$triggerRef$c3 === void 0 ? void 0 : _context$triggerRef$c3.contains(target);
      if (targetIsTrigger) event.preventDefault();
      if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) event.preventDefault();
    }
  }));
});
const $5d3850c4d0b4e6c7$var$DialogContentImpl = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CONTENT_NAME, __scopeDialog);
  const contentRef = reactExports.useRef(null);
  const composedRefs = $6ed0406888f73fc4$export$c7b2cbe3552a0d05(forwardedRef, contentRef);
  $3db38b7d1fb3fe6a$export$b7ece24a22aeda8c();
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement($d3863c46a17e8a28$export$20e40289641fbbb6, {
    asChild: true,
    loop: true,
    trapped: trapFocus,
    onMountAutoFocus: onOpenAutoFocus,
    onUnmountAutoFocus: onCloseAutoFocus
  }, /* @__PURE__ */ reactExports.createElement($5cb92bef7577960e$export$177fb62ff3ec1f22, _extends({
    role: "dialog",
    id: context.contentId,
    "aria-describedby": context.descriptionId,
    "aria-labelledby": context.titleId,
    "data-state": $5d3850c4d0b4e6c7$var$getState(context.open)
  }, contentProps, {
    ref: composedRefs,
    onDismiss: () => context.onOpenChange(false)
  }))), false);
});
const $5d3850c4d0b4e6c7$var$TITLE_NAME = "DialogTitle";
const $5d3850c4d0b4e6c7$export$16f7638e4a34b909 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...titleProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$TITLE_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.h2, _extends({
    id: context.titleId
  }, titleProps, {
    ref: forwardedRef
  }));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$16f7638e4a34b909, {
  displayName: $5d3850c4d0b4e6c7$var$TITLE_NAME
});
const $5d3850c4d0b4e6c7$var$DESCRIPTION_NAME = "DialogDescription";
const $5d3850c4d0b4e6c7$export$94e94c2ec2c954d5 = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...descriptionProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$DESCRIPTION_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.p, _extends({
    id: context.descriptionId
  }, descriptionProps, {
    ref: forwardedRef
  }));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$94e94c2ec2c954d5, {
  displayName: $5d3850c4d0b4e6c7$var$DESCRIPTION_NAME
});
const $5d3850c4d0b4e6c7$var$CLOSE_NAME = "DialogClose";
const $5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac = /* @__PURE__ */ reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeDialog, ...closeProps } = props;
  const context = $5d3850c4d0b4e6c7$var$useDialogContext($5d3850c4d0b4e6c7$var$CLOSE_NAME, __scopeDialog);
  return /* @__PURE__ */ reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.button, _extends({
    type: "button"
  }, closeProps, {
    ref: forwardedRef,
    onClick: $e42e1063c40fb3ef$export$b9ecd428b558ff10(
      props.onClick,
      () => context.onOpenChange(false)
    )
  }));
});
/* @__PURE__ */ Object.assign($5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac, {
  displayName: $5d3850c4d0b4e6c7$var$CLOSE_NAME
});
function $5d3850c4d0b4e6c7$var$getState(open) {
  return open ? "open" : "closed";
}
const $5d3850c4d0b4e6c7$export$be92b6f5f03c0fe9 = $5d3850c4d0b4e6c7$export$3ddf2d174ce01153;
const $5d3850c4d0b4e6c7$export$602eac185826482c = $5d3850c4d0b4e6c7$export$dad7c95542bacce0;
const $5d3850c4d0b4e6c7$export$c6fdb837b070b4ff = $5d3850c4d0b4e6c7$export$bd1d06c79be19e17;
const $5d3850c4d0b4e6c7$export$7c6e2c02157bb7d2 = $5d3850c4d0b4e6c7$export$b6d9565de1e068cf;
var V = '[cmdk-group=""]', X = '[cmdk-group-items=""]', ge = '[cmdk-group-heading=""]', Y = '[cmdk-item=""]', le = `${Y}:not([aria-disabled="true"])`, Q = "cmdk-item-select", M = "data-value", Re = (r, o, n) => W(r, o, n), ue = reactExports.createContext(void 0), G = () => reactExports.useContext(ue), de = reactExports.createContext(void 0), Z = () => reactExports.useContext(de), fe = reactExports.createContext(void 0), me = reactExports.forwardRef((r, o) => {
  let n = k(() => {
    var e, s2;
    return { search: "", value: (s2 = (e = r.value) != null ? e : r.defaultValue) != null ? s2 : "", filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
  }), u2 = k(() => /* @__PURE__ */ new Set()), c = k(() => /* @__PURE__ */ new Map()), d2 = k(() => /* @__PURE__ */ new Map()), f = k(() => /* @__PURE__ */ new Set()), p2 = pe(r), { label: v2, children: b2, value: l, onValueChange: y2, filter: S2, shouldFilter: C, loop: L2, disablePointerSelection: ee = false, vimBindings: j2 = true, ...H2 } = r, te = reactExports.useId(), $2 = reactExports.useId(), K2 = reactExports.useId(), x = reactExports.useRef(null), g2 = Me();
  T(() => {
    if (l !== void 0) {
      let e = l.trim();
      n.current.value = e, h.emit();
    }
  }, [l]), T(() => {
    g2(6, re);
  }, []);
  let h = reactExports.useMemo(() => ({ subscribe: (e) => (f.current.add(e), () => f.current.delete(e)), snapshot: () => n.current, setState: (e, s2, i) => {
    var a2, m2, R2;
    if (!Object.is(n.current[e], s2)) {
      if (n.current[e] = s2, e === "search") z2(), q2(), g2(1, U2);
      else if (e === "value" && (i || g2(5, re), ((a2 = p2.current) == null ? void 0 : a2.value) !== void 0)) {
        let E2 = s2 != null ? s2 : "";
        (R2 = (m2 = p2.current).onValueChange) == null || R2.call(m2, E2);
        return;
      }
      h.emit();
    }
  }, emit: () => {
    f.current.forEach((e) => e());
  } }), []), B2 = reactExports.useMemo(() => ({ value: (e, s2, i) => {
    var a2;
    s2 !== ((a2 = d2.current.get(e)) == null ? void 0 : a2.value) && (d2.current.set(e, { value: s2, keywords: i }), n.current.filtered.items.set(e, ne(s2, i)), g2(2, () => {
      q2(), h.emit();
    }));
  }, item: (e, s2) => (u2.current.add(e), s2 && (c.current.has(s2) ? c.current.get(s2).add(e) : c.current.set(s2, /* @__PURE__ */ new Set([e]))), g2(3, () => {
    z2(), q2(), n.current.value || U2(), h.emit();
  }), () => {
    d2.current.delete(e), u2.current.delete(e), n.current.filtered.items.delete(e);
    let i = O2();
    g2(4, () => {
      z2(), (i == null ? void 0 : i.getAttribute("id")) === e && U2(), h.emit();
    });
  }), group: (e) => (c.current.has(e) || c.current.set(e, /* @__PURE__ */ new Set()), () => {
    d2.current.delete(e), c.current.delete(e);
  }), filter: () => p2.current.shouldFilter, label: v2 || r["aria-label"], disablePointerSelection: ee, listId: te, inputId: K2, labelId: $2, listInnerRef: x }), []);
  function ne(e, s2) {
    var a2, m2;
    let i = (m2 = (a2 = p2.current) == null ? void 0 : a2.filter) != null ? m2 : Re;
    return e ? i(e, n.current.search, s2) : 0;
  }
  function q2() {
    if (!n.current.search || p2.current.shouldFilter === false) return;
    let e = n.current.filtered.items, s2 = [];
    n.current.filtered.groups.forEach((a2) => {
      let m2 = c.current.get(a2), R2 = 0;
      m2.forEach((E2) => {
        let P2 = e.get(E2);
        R2 = Math.max(P2, R2);
      }), s2.push([a2, R2]);
    });
    let i = x.current;
    A2().sort((a2, m2) => {
      var P2, _2;
      let R2 = a2.getAttribute("id"), E2 = m2.getAttribute("id");
      return ((P2 = e.get(E2)) != null ? P2 : 0) - ((_2 = e.get(R2)) != null ? _2 : 0);
    }).forEach((a2) => {
      let m2 = a2.closest(X);
      m2 ? m2.appendChild(a2.parentElement === m2 ? a2 : a2.closest(`${X} > *`)) : i.appendChild(a2.parentElement === i ? a2 : a2.closest(`${X} > *`));
    }), s2.sort((a2, m2) => m2[1] - a2[1]).forEach((a2) => {
      let m2 = x.current.querySelector(`${V}[${M}="${encodeURIComponent(a2[0])}"]`);
      m2 == null || m2.parentElement.appendChild(m2);
    });
  }
  function U2() {
    let e = A2().find((i) => i.getAttribute("aria-disabled") !== "true"), s2 = e == null ? void 0 : e.getAttribute(M);
    h.setState("value", s2 || void 0);
  }
  function z2() {
    var s2, i, a2, m2;
    if (!n.current.search || p2.current.shouldFilter === false) {
      n.current.filtered.count = u2.current.size;
      return;
    }
    n.current.filtered.groups = /* @__PURE__ */ new Set();
    let e = 0;
    for (let R2 of u2.current) {
      let E2 = (i = (s2 = d2.current.get(R2)) == null ? void 0 : s2.value) != null ? i : "", P2 = (m2 = (a2 = d2.current.get(R2)) == null ? void 0 : a2.keywords) != null ? m2 : [], _2 = ne(E2, P2);
      n.current.filtered.items.set(R2, _2), _2 > 0 && e++;
    }
    for (let [R2, E2] of c.current) for (let P2 of E2) if (n.current.filtered.items.get(P2) > 0) {
      n.current.filtered.groups.add(R2);
      break;
    }
    n.current.filtered.count = e;
  }
  function re() {
    var s2, i, a2;
    let e = O2();
    e && (((s2 = e.parentElement) == null ? void 0 : s2.firstChild) === e && ((a2 = (i = e.closest(V)) == null ? void 0 : i.querySelector(ge)) == null || a2.scrollIntoView({ block: "nearest" })), e.scrollIntoView({ block: "nearest" }));
  }
  function O2() {
    var e;
    return (e = x.current) == null ? void 0 : e.querySelector(`${Y}[aria-selected="true"]`);
  }
  function A2() {
    var e;
    return Array.from((e = x.current) == null ? void 0 : e.querySelectorAll(le));
  }
  function W2(e) {
    let i = A2()[e];
    i && h.setState("value", i.getAttribute(M));
  }
  function J2(e) {
    var R2;
    let s2 = O2(), i = A2(), a2 = i.findIndex((E2) => E2 === s2), m2 = i[a2 + e];
    (R2 = p2.current) != null && R2.loop && (m2 = a2 + e < 0 ? i[i.length - 1] : a2 + e === i.length ? i[0] : i[a2 + e]), m2 && h.setState("value", m2.getAttribute(M));
  }
  function oe(e) {
    let s2 = O2(), i = s2 == null ? void 0 : s2.closest(V), a2;
    for (; i && !a2; ) i = e > 0 ? we(i, V) : Ie(i, V), a2 = i == null ? void 0 : i.querySelector(le);
    a2 ? h.setState("value", a2.getAttribute(M)) : J2(e);
  }
  let ie2 = () => W2(A2().length - 1), ae = (e) => {
    e.preventDefault(), e.metaKey ? ie2() : e.altKey ? oe(1) : J2(1);
  }, se = (e) => {
    e.preventDefault(), e.metaKey ? W2(0) : e.altKey ? oe(-1) : J2(-1);
  };
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: o, tabIndex: -1, ...H2, "cmdk-root": "", onKeyDown: (e) => {
    var s2;
    if ((s2 = H2.onKeyDown) == null || s2.call(H2, e), !e.defaultPrevented) switch (e.key) {
      case "n":
      case "j": {
        j2 && e.ctrlKey && ae(e);
        break;
      }
      case "ArrowDown": {
        ae(e);
        break;
      }
      case "p":
      case "k": {
        j2 && e.ctrlKey && se(e);
        break;
      }
      case "ArrowUp": {
        se(e);
        break;
      }
      case "Home": {
        e.preventDefault(), W2(0);
        break;
      }
      case "End": {
        e.preventDefault(), ie2();
        break;
      }
      case "Enter":
        if (!e.nativeEvent.isComposing && e.keyCode !== 229) {
          e.preventDefault();
          let i = O2();
          if (i) {
            let a2 = new Event(Q);
            i.dispatchEvent(a2);
          }
        }
    }
  } }, reactExports.createElement("label", { "cmdk-label": "", htmlFor: B2.inputId, id: B2.labelId, style: De }, v2), F(r, (e) => reactExports.createElement(de.Provider, { value: h }, reactExports.createElement(ue.Provider, { value: B2 }, e))));
}), be = reactExports.forwardRef((r, o) => {
  var K2, x;
  let n = reactExports.useId(), u2 = reactExports.useRef(null), c = reactExports.useContext(fe), d2 = G(), f = pe(r), p2 = (x = (K2 = f.current) == null ? void 0 : K2.forceMount) != null ? x : c == null ? void 0 : c.forceMount;
  T(() => {
    if (!p2) return d2.item(n, c == null ? void 0 : c.id);
  }, [p2]);
  let v2 = ve(n, u2, [r.value, r.children, u2], r.keywords), b2 = Z(), l = D((g2) => g2.value && g2.value === v2.current), y2 = D((g2) => p2 || d2.filter() === false ? true : g2.search ? g2.filtered.items.get(n) > 0 : true);
  reactExports.useEffect(() => {
    let g2 = u2.current;
    if (!(!g2 || r.disabled)) return g2.addEventListener(Q, S2), () => g2.removeEventListener(Q, S2);
  }, [y2, r.onSelect, r.disabled]);
  function S2() {
    var g2, h;
    C(), (h = (g2 = f.current).onSelect) == null || h.call(g2, v2.current);
  }
  function C() {
    b2.setState("value", v2.current, true);
  }
  if (!y2) return null;
  let { disabled: L2, value: ee, onSelect: j2, forceMount: H2, keywords: te, ...$2 } = r;
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N([u2, o]), ...$2, id: n, "cmdk-item": "", role: "option", "aria-disabled": !!L2, "aria-selected": !!l, "data-disabled": !!L2, "data-selected": !!l, onPointerMove: L2 || d2.disablePointerSelection ? void 0 : C, onClick: L2 ? void 0 : S2 }, r.children);
}), he = reactExports.forwardRef((r, o) => {
  let { heading: n, children: u2, forceMount: c, ...d2 } = r, f = reactExports.useId(), p2 = reactExports.useRef(null), v2 = reactExports.useRef(null), b2 = reactExports.useId(), l = G(), y2 = D((C) => c || l.filter() === false ? true : C.search ? C.filtered.groups.has(f) : true);
  T(() => l.group(f), []), ve(f, p2, [r.value, r.heading, v2]);
  let S2 = reactExports.useMemo(() => ({ id: f, forceMount: c }), [c]);
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N([p2, o]), ...d2, "cmdk-group": "", role: "presentation", hidden: y2 ? void 0 : true }, n && reactExports.createElement("div", { ref: v2, "cmdk-group-heading": "", "aria-hidden": true, id: b2 }, n), F(r, (C) => reactExports.createElement("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": n ? b2 : void 0 }, reactExports.createElement(fe.Provider, { value: S2 }, C))));
}), ye = reactExports.forwardRef((r, o) => {
  let { alwaysRender: n, ...u2 } = r, c = reactExports.useRef(null), d2 = D((f) => !f.search);
  return !n && !d2 ? null : reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N([c, o]), ...u2, "cmdk-separator": "", role: "separator" });
}), Ee = reactExports.forwardRef((r, o) => {
  let { onValueChange: n, ...u2 } = r, c = r.value != null, d2 = Z(), f = D((l) => l.search), p2 = D((l) => l.value), v2 = G(), b2 = reactExports.useMemo(() => {
    var y2;
    let l = (y2 = v2.listInnerRef.current) == null ? void 0 : y2.querySelector(`${Y}[${M}="${encodeURIComponent(p2)}"]`);
    return l == null ? void 0 : l.getAttribute("id");
  }, []);
  return reactExports.useEffect(() => {
    r.value != null && d2.setState("search", r.value);
  }, [r.value]), reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.input, { ref: o, ...u2, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: false, "aria-autocomplete": "list", role: "combobox", "aria-expanded": true, "aria-controls": v2.listId, "aria-labelledby": v2.labelId, "aria-activedescendant": b2, id: v2.inputId, type: "text", value: c ? r.value : f, onChange: (l) => {
    c || d2.setState("search", l.target.value), n == null || n(l.target.value);
  } });
}), Se = reactExports.forwardRef((r, o) => {
  let { children: n, label: u2 = "Suggestions", ...c } = r, d2 = reactExports.useRef(null), f = reactExports.useRef(null), p2 = G();
  return reactExports.useEffect(() => {
    if (f.current && d2.current) {
      let v2 = f.current, b2 = d2.current, l, y2 = new ResizeObserver(() => {
        l = requestAnimationFrame(() => {
          let S2 = v2.offsetHeight;
          b2.style.setProperty("--cmdk-list-height", S2.toFixed(1) + "px");
        });
      });
      return y2.observe(v2), () => {
        cancelAnimationFrame(l), y2.unobserve(v2);
      };
    }
  }, []), reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: N([d2, o]), ...c, "cmdk-list": "", role: "listbox", "aria-label": u2, id: p2.listId }, F(r, (v2) => reactExports.createElement("div", { ref: N([f, p2.listInnerRef]), "cmdk-list-sizer": "" }, v2)));
}), Ce = reactExports.forwardRef((r, o) => {
  let { open: n, onOpenChange: u2, overlayClassName: c, contentClassName: d2, container: f, ...p2 } = r;
  return reactExports.createElement($5d3850c4d0b4e6c7$export$be92b6f5f03c0fe9, { open: n, onOpenChange: u2 }, reactExports.createElement($5d3850c4d0b4e6c7$export$602eac185826482c, { container: f }, reactExports.createElement($5d3850c4d0b4e6c7$export$c6fdb837b070b4ff, { "cmdk-overlay": "", className: c }), reactExports.createElement($5d3850c4d0b4e6c7$export$7c6e2c02157bb7d2, { "aria-label": r.label, "cmdk-dialog": "", className: d2 }, reactExports.createElement(me, { ref: o, ...p2 }))));
}), xe = reactExports.forwardRef((r, o) => D((u2) => u2.filtered.count === 0) ? reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: o, ...r, "cmdk-empty": "", role: "presentation" }) : null), Pe = reactExports.forwardRef((r, o) => {
  let { progress: n, children: u2, label: c = "Loading...", ...d2 } = r;
  return reactExports.createElement($8927f6f2acc4f386$export$250ffa63cdc0d034.div, { ref: o, ...d2, "cmdk-loading": "", role: "progressbar", "aria-valuenow": n, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": c }, F(r, (f) => reactExports.createElement("div", { "aria-hidden": true }, f)));
}), He = Object.assign(me, { List: Se, Item: be, Input: Ee, Group: he, Separator: ye, Dialog: Ce, Empty: xe, Loading: Pe });
function we(r, o) {
  let n = r.nextElementSibling;
  for (; n; ) {
    if (n.matches(o)) return n;
    n = n.nextElementSibling;
  }
}
function Ie(r, o) {
  let n = r.previousElementSibling;
  for (; n; ) {
    if (n.matches(o)) return n;
    n = n.previousElementSibling;
  }
}
function pe(r) {
  let o = reactExports.useRef(r);
  return T(() => {
    o.current = r;
  }), o;
}
var T = typeof window == "undefined" ? reactExports.useEffect : reactExports.useLayoutEffect;
function k(r) {
  let o = reactExports.useRef();
  return o.current === void 0 && (o.current = r()), o;
}
function N(r) {
  return (o) => {
    r.forEach((n) => {
      typeof n == "function" ? n(o) : n != null && (n.current = o);
    });
  };
}
function D(r) {
  let o = Z(), n = () => r(o.snapshot());
  return reactExports.useSyncExternalStore(o.subscribe, n, n);
}
function ve(r, o, n, u2 = []) {
  let c = reactExports.useRef(), d2 = G();
  return T(() => {
    var v2;
    let f = (() => {
      var b2;
      for (let l of n) {
        if (typeof l == "string") return l.trim();
        if (typeof l == "object" && "current" in l) return l.current ? (b2 = l.current.textContent) == null ? void 0 : b2.trim() : c.current;
      }
    })(), p2 = u2.map((b2) => b2.trim());
    d2.value(r, f, p2), (v2 = o.current) == null || v2.setAttribute(M, f), c.current = f;
  }), c;
}
var Me = () => {
  let [r, o] = reactExports.useState(), n = k(() => /* @__PURE__ */ new Map());
  return T(() => {
    n.current.forEach((u2) => u2()), n.current = /* @__PURE__ */ new Map();
  }, [r]), (u2, c) => {
    n.current.set(u2, c), o({});
  };
};
function Te(r) {
  let o = r.type;
  return typeof o == "function" ? o(r.props) : "render" in o ? o.render(r.props) : r;
}
function F({ asChild: r, children: o }, n) {
  return r && reactExports.isValidElement(o) ? reactExports.cloneElement(Te(o), { ref: o.ref }, n(o.props.children)) : n(o);
}
var De = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He,
  {
    ref,
    className: cn$1(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = He.displayName;
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    He.Input,
    {
      ref,
      className: cn$1(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = He.Input.displayName;
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He.List,
  {
    ref,
    className: cn$1("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = He.List.displayName;
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He.Empty,
  {
    ref,
    className: "py-6 text-center text-sm",
    ...props
  }
));
CommandEmpty.displayName = He.Empty.displayName;
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He.Group,
  {
    ref,
    className: cn$1(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = He.Group.displayName;
const CommandSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He.Separator,
  {
    ref,
    className: cn$1("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = He.Separator.displayName;
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  He.Item,
  {
    ref,
    className: cn$1(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    ),
    ...props
  }
));
CommandItem.displayName = He.Item.displayName;
function BillingAddressComboBox({
  name,
  control,
  label,
  placeholder,
  useList,
  onSelectionChange,
  disabled = false
}) {
  const { data, isLoading } = useList();
  const [open, setOpen] = reactExports.useState(false);
  const [showFreeForm, setShowFreeForm] = reactExports.useState(false);
  const items = (data == null ? void 0 : data.data) || [];
  reactExports.useEffect(() => {
    setShowFreeForm(items.length === 0 && !isLoading);
  }, [items, isLoading]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    FormField,
    {
      control,
      name,
      render: ({ field }) => {
        var _a;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: label }),
          showFreeForm ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: `Enter ${label.toLowerCase()}`,
              ...field,
              disabled
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                role: "combobox",
                disabled: disabled || isLoading,
                className: cn$1(
                  "w-full justify-between",
                  !field.value && "text-muted-foreground"
                ),
                children: [
                  isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-[100px]" }) : field.value ? (_a = items == null ? void 0 : items.find((item) => item.code === field.value)) == null ? void 0 : _a.name : placeholder,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
                ]
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-full p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Command,
              {
                filter: (value, search) => {
                  var _a2, _b;
                  const name2 = (_a2 = items == null ? void 0 : items.find(
                    (item) => item.code.toLowerCase() === value.toLowerCase()
                  )) == null ? void 0 : _a2.name;
                  if (value.includes(search) || ((_b = name2 == null ? void 0 : name2.toLowerCase()) == null ? void 0 : _b.includes(search.toLowerCase()))) {
                    return 1;
                  }
                  return 0;
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: `Search ${label}...` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandEmpty, { children: [
                      "No ",
                      label,
                      " found."
                    ] }),
                    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }) }) : items == null ? void 0 : items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CommandItem,
                      {
                        value: item.code,
                        onSelect: () => {
                          field.onChange(item.code);
                          if (onSelectionChange) {
                            onSelectionChange(item.code);
                          }
                          setOpen(false);
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Check,
                            {
                              className: cn$1(
                                "mr-2 h-4 w-4",
                                item.code === field.value ? "opacity-100" : "opacity-0"
                              )
                            }
                          ),
                          item.name
                        ]
                      },
                      item.code
                    ))
                  ] })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] });
      }
    }
  );
}
function BillingInformation() {
  const { billingInfo, isLoading: isBillingInfoLoading } = useBillingInfo();
  const { submitBillingInfo, isSubmitting } = useSubmitBillingInfo();
  const [isInitialized, setIsInitialized] = reactExports.useState(false);
  const [supportedEntities, setSupportedEntities] = reactExports.useState([]);
  const useCountryList = () => zt({ resource: "account/subscription/billing/countries" });
  const { data: countryData } = useCountryList();
  const form = useForm({
    resolver: t(createBillingInfoSchema(supportedEntities)),
    defaultValues: {
      name: "",
      country: ""
    },
    mode: "onBlur"
  });
  const useStateList = () => zt({
    resource: "account/subscription/billing/states",
    filters: [
      { field: "country", operator: "eq", value: form.watch("country") }
    ]
  });
  const useCityList = () => zt({
    resource: "account/subscription/billing/cities",
    filters: [
      { field: "country", operator: "eq", value: form.watch("country") },
      { field: "state", operator: "eq", value: form.watch("state") }
    ]
  });
  reactExports.useEffect(() => {
    if (billingInfo && !isInitialized) {
      console.log("Billing info loaded:", billingInfo);
      form.reset(billingInfo);
      setIsInitialized(true);
    }
  }, [billingInfo, form, isInitialized]);
  reactExports.useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedCountryData = countryData == null ? void 0 : countryData.data.find(
      (country) => country.code === selectedCountry
    );
    const entities = (selectedCountryData == null ? void 0 : selectedCountryData.supported_entities) || [];
    setSupportedEntities(entities);
    form.reset(form.getValues(), { keepValues: true });
  }, [form.watch("country"), countryData]);
  const onSubmit = async (data) => {
    try {
      await submitBillingInfo(data);
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        Object.entries(error).forEach(([field, message]) => {
          form.setError(field, {
            type: "manual",
            message
          });
        });
      } else {
        console.error("Error submitting billing info:", error);
      }
    }
  };
  const handleCountryChange = () => {
    form.setValue("state", void 0);
    form.setValue("city", void 0);
  };
  const handleStateChange = () => {
    form.setValue("city", void 0);
  };
  if (isBillingInfoLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-center min-h-screen p-4 pt-60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3 mx-auto" })
    ] }) });
  }
  const renderField = (fieldName) => {
    const entityCode = Object.keys(fieldMapping).find(
      (key) => fieldMapping[key] === fieldName
    );
    if (!supportedEntities.includes(entityCode)) {
      return null;
    }
    switch (fieldName) {
      case "address":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: "address",
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { ...field, rows: 3 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
      case "city":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          BillingAddressComboBox,
          {
            name: "city",
            control: form.control,
            label: "City",
            placeholder: "Select City",
            useList: useCityList,
            disabled: !form.watch("state")
          }
        );
      case "state":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          BillingAddressComboBox,
          {
            name: "state",
            control: form.control,
            label: "State",
            placeholder: "Select State",
            useList: useStateList,
            onSelectionChange: handleStateChange,
            disabled: !form.watch("country")
          }
        );
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormField,
          {
            control: form.control,
            name: fieldName,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: fieldName.charAt(0).toUpperCase() + fieldName.slice(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
            ] })
          }
        );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Billing Information" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormField,
        {
          control: form.control,
          name: "name",
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...field }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BillingAddressComboBox,
        {
          name: "country",
          control: form.control,
          label: "Country",
          placeholder: "Select Country",
          useList: useCountryList,
          onSelectionChange: handleCountryChange
        }
      ),
      Object.keys(fieldMapping).map(
        (key) => renderField(fieldMapping[key])
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardFooter, { className: "px-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          className: "ml-auto",
          disabled: isSubmitting || !form.formState.isValid,
          children: isSubmitting ? "Saving..." : "Save"
        }
      ) })
    ] }) }) })
  ] });
}
function Subscription() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionProvider, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionContent, {})
  });
}
function SubscriptionContent() {
  const {
    isLoading
  } = useSubscriptionContext();
  const paidBillingEnabled = useIsPaidBillingEnabled();
  const onFreePlan = useOnFreePlan();
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonSubscription, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "grid lg:grid-cols-3 gap-6",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "lg:col-span-3",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(PricingPlans, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "lg:col-span-1 flex flex-col gap-6",
      children: [paidBillingEnabled && !onFreePlan && /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionHistory, {}), paidBillingEnabled && !onFreePlan && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePaymentMethod, {}), false]
    }), paidBillingEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "lg:col-span-2",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(BillingInformation, {})
    })]
  });
}
function SkeletonSubscription() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "grid lg:grid-cols-3 gap-6",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "lg:col-span-1 flex flex-col gap-6",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "lg:col-span-2",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, {
        className: "h-48"
      })
    })]
  });
}
export {
  Subscription as default
};
