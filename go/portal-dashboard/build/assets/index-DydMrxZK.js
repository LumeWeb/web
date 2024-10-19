import { j as jsxRuntimeExports, g as getDefaultExportFromCjs, R as React, r as reactExports } from "./jsx-runtime-IZdvEyt_.js";
import { m as mc, L as Le, T as Te, P as Pe, o as oo } from "./index-DU1IfKY5.js";
import { V as VerificationNoticeContent, G as GeneralLayout } from "./GeneralLayout-DFAD2LNJ.js";
import { D as DataTable } from "./DataTable-BaPF79vq.js";
import { A as AddIcon } from "./icons-DfV8n6Ey.js";
import { c as cn, B as Button, a as cva } from "./button-CzfLTIHt.js";
import { I as Input } from "./input-B6UnxZyR.js";
import { t } from "./zod-DADFYJkp.js";
import { x as xe } from "./index-BWzHRlC6.js";
import { o as objectType, a as arrayType, s as stringType } from "./index-BpxO7BrF.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-Dc2H5Ola.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-D6SmLySg.js";
import { F as Form, a as FormField, b as FormItem, c as FormControl, d as FormMessage } from "./form-D1HtfKzz.js";
import { u as useActiveService, I as IPFS_SUBFOLDER_ROUTE, C as CID, S as SERVICE_ROUTE } from "./useActiveService-BbjXW4qB.js";
import { u as useEmailVerification } from "./useEmailVerification-CG_UnQY0.js";
import { a as useSearchParams } from "./index-CfDxhBvB.js";
import { S as Search } from "./search-ChO2Fdmu.js";
import { c as createLucideIcon } from "./Combination-BC6FEbU4.js";
import "./avatar-BEvRnn4D.js";
import "./index-C-2rzX6a.js";
import "./index-BquAYmyk.js";
import "./index-DiXcXsr5.js";
import "./useFeatureFlag-PPzt5-ch.js";
import "./usePortalMeta-BrKLDHxF.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./useTheme-Wun3lQOi.js";
import "./index-CXs_k2So.js";
import "./index-B2actZrY.js";
import "./index-BTwtRxOU.js";
import "./usePluginMeta-BNkMCdOH.js";
import "./LumeLogo-UyKObroS.js";
import "./lume-logo-ChvyOqr_.js";
import "./components-DMYkXxdw.js";
import "./index-O1NGHMyc.js";
import "./sheet-BiOScmXk.js";
import "./index-DUTfRgmH.js";
import "./label-DPLqB6Bj.js";
import "./select-DonCKqC4.js";
import "./index-WXDFwduM.js";
import "./filesize-DaDW_CYa.js";
import "./Forms-BYhGkaay.js";
import "./textarea-C63kCrGx.js";
import "./alert-BS46AoM-.js";
import "./index-Dv9Lz1jY.js";
import "./skeleton-DwNK_yGs.js";
import "./index-7xjrsmwg.js";
import "./useSdk-Bk9IxULM.js";
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronRight = createLucideIcon("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const X = createLucideIcon("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
const tagVariants = cva(
  "transition-all border inline-flex items-center text-sm pl-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50",
        primary: "bg-primary border-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
        destructive: "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
      },
      size: {
        sm: "text-xs h-7",
        md: "text-sm h-8",
        lg: "text-base h-9",
        xl: "text-lg h-10"
      },
      shape: {
        default: "rounded-sm",
        rounded: "rounded-lg",
        square: "rounded-none",
        pill: "rounded-full"
      },
      borderStyle: {
        default: "border-solid",
        none: "border-none",
        dashed: "border-dashed",
        dotted: "border-dotted",
        double: "border-double"
      },
      textCase: {
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize"
      },
      interaction: {
        clickable: "cursor-pointer hover:shadow-md",
        nonClickable: "cursor-default"
      },
      animation: {
        none: "",
        fadeIn: "animate-fadeIn",
        slideIn: "animate-slideIn",
        bounce: "animate-bounce"
      },
      textStyle: {
        normal: "font-normal",
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        lineThrough: "line-through"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
      borderStyle: "default",
      interaction: "nonClickable",
      animation: "fadeIn",
      textStyle: "normal"
    }
  }
);
const Tag = ({
  tagObj,
  direction,
  draggable,
  onTagClick,
  onRemoveTag,
  variant,
  size,
  shape,
  borderStyle,
  textCase,
  interaction,
  animation,
  textStyle,
  isActiveTag,
  tagClasses,
  disabled
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      draggable,
      className: cn(
        tagVariants({
          variant,
          size,
          shape,
          borderStyle,
          textCase,
          interaction,
          animation,
          textStyle
        }),
        {
          "justify-between w-full": direction === "column",
          "cursor-pointer": draggable,
          "ring-ring ring-offset-2 ring-2 ring-offset-background": isActiveTag
        },
        tagClasses == null ? void 0 : tagClasses.body
      ),
      onClick: () => onTagClick == null ? void 0 : onTagClick(tagObj),
      children: [
        tagObj.text,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            onClick: (e) => {
              e.stopPropagation();
              onRemoveTag(tagObj.id);
            },
            disabled,
            className: cn(
              `py-1 px-3 h-full hover:bg-transparent`,
              tagClasses == null ? void 0 : tagClasses.closeButton
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "14",
                height: "14",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                className: "lucide lucide-x",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6 6 18" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6 6 12 12" })
                ]
              }
            )
          }
        )
      ]
    },
    tagObj.id
  );
};
var arrayMove$2 = { exports: {} };
const arrayMoveMutate = (array, from, to) => {
  const startIndex = from < 0 ? array.length + from : from;
  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = to < 0 ? array.length + to : to;
    const [item] = array.splice(from, 1);
    array.splice(endIndex, 0, item);
  }
};
const arrayMove = (array, from, to) => {
  array = [...array];
  arrayMoveMutate(array, from, to);
  return array;
};
arrayMove$2.exports = arrayMove;
arrayMove$2.exports.mutate = arrayMoveMutate;
var arrayMoveExports = arrayMove$2.exports;
const arrayMove$1 = /* @__PURE__ */ getDefaultExportFromCjs(arrayMoveExports);
const findItemIndexAtPosition = ({ x, y }, itemsRect, { fallbackToClosest = false } = {}) => {
  let smallestDistance = 1e4;
  let smallestDistanceIndex = -1;
  for (let index = 0; index < itemsRect.length; index += 1) {
    const rect = itemsRect[index];
    if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) {
      return index;
    }
    if (fallbackToClosest) {
      const itemCenterX = (rect.left + rect.right) / 2;
      const itemCenterY = (rect.top + rect.bottom) / 2;
      const distance = Math.sqrt(
        Math.pow(x - itemCenterX, 2) + Math.pow(y - itemCenterY, 2)
      );
      if (distance < smallestDistance) {
        smallestDistance = distance;
        smallestDistanceIndex = index;
      }
    }
  }
  return smallestDistanceIndex;
};
const getMousePoint = (e) => ({
  x: Number(e.clientX),
  y: Number(e.clientY)
});
const getTouchPoint = (touch) => ({
  x: Number(touch.clientX),
  y: Number(touch.clientY)
});
const getPointInContainer = (point, containerTopLeft) => {
  return {
    x: point.x - containerTopLeft.x,
    y: point.y - containerTopLeft.y
  };
};
const preventDefault = (event) => {
  event.preventDefault();
};
const disableContextMenu = () => {
  window.addEventListener("contextmenu", preventDefault, {
    capture: true,
    passive: false
  });
};
const enableContextMenu = () => {
  window.removeEventListener("contextmenu", preventDefault);
};
const useDrag = ({
  onStart,
  onMove,
  onEnd,
  allowDrag = true,
  containerRef,
  knobs
}) => {
  const containerPositionRef = React.useRef({ x: 0, y: 0 });
  const handleTouchStartTimerRef = React.useRef(void 0);
  const isFirstMoveRef = React.useRef(false);
  const callbacksRef = React.useRef({ onStart, onMove, onEnd });
  const [isTouchDevice, setTouchDevice] = React.useState(false);
  React.useEffect(() => {
    callbacksRef.current = { onStart, onMove, onEnd };
  }, [onStart, onMove, onEnd]);
  const cancelTouchStart = () => {
    if (handleTouchStartTimerRef.current) {
      window.clearTimeout(handleTouchStartTimerRef.current);
    }
  };
  const saveContainerPosition = React.useCallback(() => {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      containerPositionRef.current = { x: bounds.left, y: bounds.top };
    }
  }, [containerRef]);
  const onDrag = React.useCallback((pointInWindow) => {
    const point = getPointInContainer(
      pointInWindow,
      containerPositionRef.current
    );
    if (callbacksRef.current.onMove) {
      callbacksRef.current.onMove({ pointInWindow, point });
    }
  }, []);
  const onMouseMove = React.useCallback(
    (e) => {
      if (isFirstMoveRef.current) {
        isFirstMoveRef.current = false;
        const pointInWindow = getMousePoint(e);
        const point = getPointInContainer(
          pointInWindow,
          containerPositionRef.current
        );
        if (callbacksRef.current.onStart) {
          callbacksRef.current.onStart({ point, pointInWindow });
        }
      } else {
        onDrag(getMousePoint(e));
      }
    },
    [onDrag]
  );
  const onTouchMove = React.useCallback(
    (e) => {
      if (e.cancelable) {
        e.preventDefault();
        onDrag(getTouchPoint(e.touches[0]));
      } else {
        document.removeEventListener("touchmove", onTouchMove);
        if (callbacksRef.current.onEnd) {
          callbacksRef.current.onEnd();
        }
      }
    },
    [onDrag]
  );
  const onMouseUp = React.useCallback(() => {
    isFirstMoveRef.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (callbacksRef.current.onEnd) {
      callbacksRef.current.onEnd();
    }
  }, [onMouseMove]);
  const onTouchEnd = React.useCallback(() => {
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
    enableContextMenu();
    if (callbacksRef.current.onEnd) {
      callbacksRef.current.onEnd();
    }
  }, [onTouchMove]);
  const onMouseDown = React.useCallback(
    (e) => {
      if (e.button !== 0) {
        return;
      }
      if ((knobs == null ? void 0 : knobs.length) && !knobs.find((knob) => knob.contains(e.target))) {
        return;
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      saveContainerPosition();
      isFirstMoveRef.current = true;
    },
    [onMouseMove, onMouseUp, saveContainerPosition, knobs]
  );
  const handleTouchStart = React.useCallback(
    (point, pointInWindow) => {
      document.addEventListener("touchmove", onTouchMove, {
        capture: false,
        passive: false
      });
      document.addEventListener("touchend", onTouchEnd);
      disableContextMenu();
      if (callbacksRef.current.onStart) {
        callbacksRef.current.onStart({ point, pointInWindow });
      }
    },
    [onTouchEnd, onTouchMove]
  );
  const onTouchStart = React.useCallback(
    (e) => {
      if ((knobs == null ? void 0 : knobs.length) && !knobs.find((knob) => knob.contains(e.target))) {
        return;
      }
      saveContainerPosition();
      const pointInWindow = getTouchPoint(e.touches[0]);
      const point = getPointInContainer(
        pointInWindow,
        containerPositionRef.current
      );
      handleTouchStartTimerRef.current = window.setTimeout(
        () => handleTouchStart(point, pointInWindow),
        120
      );
    },
    [handleTouchStart, saveContainerPosition, knobs]
  );
  const detectTouchDevice = React.useCallback(() => {
    setTouchDevice(true);
    document.removeEventListener("touchstart", detectTouchDevice);
  }, []);
  const touchScrollListener = React.useCallback(() => {
    cancelTouchStart();
  }, []);
  React.useLayoutEffect(() => {
    if (isTouchDevice) {
      const container = containerRef.current;
      if (allowDrag) {
        container == null ? void 0 : container.addEventListener("touchstart", onTouchStart, {
          capture: true,
          passive: false
        });
        document.addEventListener("touchmove", touchScrollListener, {
          capture: false,
          passive: false
        });
        document.addEventListener("touchend", touchScrollListener, {
          capture: false,
          passive: false
        });
      }
      return () => {
        container == null ? void 0 : container.removeEventListener("touchstart", onTouchStart, {
          capture: true
        });
        document.removeEventListener("touchmove", touchScrollListener, {
          capture: false
        });
        document.removeEventListener("touchend", touchScrollListener, {
          capture: false
        });
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
        enableContextMenu();
        cancelTouchStart();
      };
    }
    document.addEventListener("touchstart", detectTouchDevice);
    return () => {
      document.removeEventListener("touchstart", detectTouchDevice);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    isTouchDevice,
    allowDrag,
    detectTouchDevice,
    onMouseMove,
    onTouchMove,
    touchScrollListener,
    onTouchEnd,
    onMouseUp,
    containerRef,
    onTouchStart
  ]);
  return isTouchDevice ? {} : { onMouseDown };
};
const useDropTarget = (content) => {
  const dropTargetRef = React.useRef(null);
  if (!content) {
    return {};
  }
  const show = (sourceRect) => {
    if (dropTargetRef.current) {
      dropTargetRef.current.style.width = `${sourceRect.width}px`;
      dropTargetRef.current.style.height = `${sourceRect.height}px`;
      dropTargetRef.current.style.opacity = "1";
      dropTargetRef.current.style.visibility = "visible";
    }
  };
  const hide = () => {
    if (dropTargetRef.current) {
      dropTargetRef.current.style.opacity = "0";
      dropTargetRef.current.style.visibility = "hidden";
    }
  };
  const setPosition = (index, itemsRect, lockAxis) => {
    if (dropTargetRef.current) {
      const sourceRect = itemsRect[index];
      const newX = lockAxis === "y" ? sourceRect.left : itemsRect[index].left;
      const newY = lockAxis === "x" ? sourceRect.top : itemsRect[index].top;
      dropTargetRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
    }
  };
  const DropTargetWrapper = () => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: dropTargetRef,
      "aria-hidden": true,
      style: {
        opacity: 0,
        visibility: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none"
      },
      children: content
    }
  );
  return {
    show,
    hide,
    setPosition,
    render: DropTargetWrapper
  };
};
const DEFAULT_CONTAINER_TAG = "div";
const SortableListContext = React.createContext(void 0);
const SortableList = ({
  children,
  allowDrag = true,
  onSortEnd,
  draggedItemClassName,
  as,
  lockAxis,
  customHolderRef,
  dropTarget,
  ...rest
}) => {
  var _a;
  const itemsRef = React.useRef([]);
  const itemsRect = React.useRef([]);
  const knobs = React.useRef([]);
  const containerRef = React.useRef(null);
  const targetRef = React.useRef(null);
  const sourceIndexRef = React.useRef(void 0);
  const lastTargetIndexRef = React.useRef(void 0);
  const offsetPointRef = React.useRef({ x: 0, y: 0 });
  const dropTargetLogic = useDropTarget(dropTarget);
  React.useEffect(() => {
    const holder = (customHolderRef == null ? void 0 : customHolderRef.current) || document.body;
    return () => {
      if (targetRef.current) {
        holder.removeChild(targetRef.current);
      }
    };
  }, [customHolderRef]);
  const updateTargetPosition = (position) => {
    if (targetRef.current && sourceIndexRef.current !== void 0) {
      const offset = offsetPointRef.current;
      const sourceRect = itemsRect.current[sourceIndexRef.current];
      const newX = lockAxis === "y" ? sourceRect.left : position.x - offset.x;
      const newY = lockAxis === "x" ? sourceRect.top : position.y - offset.y;
      targetRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
    }
  };
  const copyItem = React.useCallback(
    (sourceIndex) => {
      if (!containerRef.current) {
        return;
      }
      const source = itemsRef.current[sourceIndex];
      const sourceRect = itemsRect.current[sourceIndex];
      const copy = source.cloneNode(true);
      if (draggedItemClassName) {
        draggedItemClassName.split(" ").forEach((c) => copy.classList.add(c));
      }
      copy.style.width = `${sourceRect.width}px`;
      copy.style.height = `${sourceRect.height}px`;
      copy.style.position = "fixed";
      copy.style.margin = "0";
      copy.style.top = "0";
      copy.style.left = "0";
      const sourceCanvases = source.querySelectorAll("canvas");
      copy.querySelectorAll("canvas").forEach((canvas, index) => {
        var _a2;
        (_a2 = canvas.getContext("2d")) == null ? void 0 : _a2.drawImage(sourceCanvases[index], 0, 0);
      });
      const holder = (customHolderRef == null ? void 0 : customHolderRef.current) || document.body;
      holder.appendChild(copy);
      targetRef.current = copy;
    },
    [customHolderRef, draggedItemClassName]
  );
  const listeners = useDrag({
    allowDrag,
    containerRef,
    knobs: knobs.current,
    onStart: ({ pointInWindow }) => {
      var _a2;
      if (!containerRef.current) {
        return;
      }
      itemsRect.current = itemsRef.current.map(
        (item) => item.getBoundingClientRect()
      );
      const sourceIndex = findItemIndexAtPosition(
        pointInWindow,
        itemsRect.current
      );
      if (sourceIndex === -1) {
        return;
      }
      sourceIndexRef.current = sourceIndex;
      copyItem(sourceIndex);
      const source = itemsRef.current[sourceIndex];
      source.style.opacity = "0";
      source.style.visibility = "hidden";
      const sourceRect = source.getBoundingClientRect();
      offsetPointRef.current = {
        x: pointInWindow.x - sourceRect.left,
        y: pointInWindow.y - sourceRect.top
      };
      updateTargetPosition(pointInWindow);
      (_a2 = dropTargetLogic.show) == null ? void 0 : _a2.call(dropTargetLogic, sourceRect);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
    },
    onMove: ({ pointInWindow }) => {
      var _a2;
      updateTargetPosition(pointInWindow);
      const sourceIndex = sourceIndexRef.current;
      if (sourceIndex === void 0 || sourceIndexRef.current === void 0) {
        return;
      }
      const sourceRect = itemsRect.current[sourceIndexRef.current];
      const targetPoint = {
        x: lockAxis === "y" ? sourceRect.left : pointInWindow.x,
        y: lockAxis === "x" ? sourceRect.top : pointInWindow.y
      };
      const targetIndex = findItemIndexAtPosition(
        targetPoint,
        itemsRect.current,
        {
          fallbackToClosest: true
        }
      );
      if (targetIndex === -1) {
        return;
      }
      lastTargetIndexRef.current = targetIndex;
      const isMovingRight = sourceIndex < targetIndex;
      for (let index = 0; index < itemsRef.current.length; index += 1) {
        const currentItem = itemsRef.current[index];
        const currentItemRect = itemsRect.current[index];
        if (isMovingRight && index >= sourceIndex && index <= targetIndex || !isMovingRight && index >= targetIndex && index <= sourceIndex) {
          const nextItemRects = itemsRect.current[isMovingRight ? index - 1 : index + 1];
          if (nextItemRects) {
            const translateX = nextItemRects.left - currentItemRect.left;
            const translateY = nextItemRects.top - currentItemRect.top;
            currentItem.style.transform = `translate3d(${translateX}px, ${translateY}px, 0px)`;
          }
        } else {
          currentItem.style.transform = "translate3d(0,0,0)";
        }
        currentItem.style.transitionDuration = "300ms";
      }
      (_a2 = dropTargetLogic.setPosition) == null ? void 0 : _a2.call(
        dropTargetLogic,
        lastTargetIndexRef.current,
        itemsRect.current,
        lockAxis
      );
    },
    onEnd: () => {
      var _a2;
      for (let index = 0; index < itemsRef.current.length; index += 1) {
        const currentItem = itemsRef.current[index];
        currentItem.style.transform = "";
        currentItem.style.transitionDuration = "";
      }
      const sourceIndex = sourceIndexRef.current;
      if (sourceIndex !== void 0) {
        const source = itemsRef.current[sourceIndex];
        if (source) {
          source.style.opacity = "1";
          source.style.visibility = "";
        }
        const targetIndex = lastTargetIndexRef.current;
        if (targetIndex !== void 0) {
          if (sourceIndex !== targetIndex) {
            itemsRef.current = arrayMove$1(
              itemsRef.current,
              sourceIndex,
              targetIndex
            );
            onSortEnd(sourceIndex, targetIndex);
          }
        }
      }
      sourceIndexRef.current = void 0;
      lastTargetIndexRef.current = void 0;
      (_a2 = dropTargetLogic.hide) == null ? void 0 : _a2.call(dropTargetLogic);
      if (targetRef.current) {
        const holder = (customHolderRef == null ? void 0 : customHolderRef.current) || document.body;
        holder.removeChild(targetRef.current);
        targetRef.current = null;
      }
    }
  });
  const registerItem = React.useCallback((item) => {
    itemsRef.current.push(item);
  }, []);
  const removeItem = React.useCallback((item) => {
    const index = itemsRef.current.indexOf(item);
    if (index !== -1) {
      itemsRef.current.splice(index, 1);
    }
  }, []);
  const registerKnob = React.useCallback((item) => {
    knobs.current.push(item);
  }, []);
  const removeKnob = React.useCallback((item) => {
    const index = knobs.current.indexOf(item);
    if (index !== -1) {
      knobs.current.splice(index, 1);
    }
  }, []);
  const context = React.useMemo(
    () => ({ registerItem, removeItem, registerKnob, removeKnob }),
    [registerItem, removeItem, registerKnob, removeKnob]
  );
  return React.createElement(
    as || DEFAULT_CONTAINER_TAG,
    {
      ...allowDrag ? listeners : {},
      ...rest,
      ref: containerRef
    },
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SortableListContext.Provider, { value: context, children: [
      children,
      (_a = dropTargetLogic.render) == null ? void 0 : _a.call(dropTargetLogic)
    ] })
  );
};
const SortableItem = ({ children }) => {
  const context = React.useContext(SortableListContext);
  if (!context) {
    throw new Error("SortableItem must be a child of SortableList");
  }
  const { registerItem, removeItem } = context;
  const elementRef = React.useRef(null);
  React.useEffect(() => {
    const currentItem = elementRef.current;
    if (currentItem) {
      registerItem(currentItem);
    }
    return () => {
      if (currentItem) {
        removeItem(currentItem);
      }
    };
  }, [registerItem, removeItem, children]);
  return React.cloneElement(children, { ref: elementRef });
};
const DropTarget = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-full rounded-md bg-secondary/50") });
};
const TagList = ({
  tags,
  customTagRenderer,
  direction,
  draggable,
  onSortEnd,
  className,
  inlineTags,
  activeTagIndex,
  setActiveTagIndex,
  classStyleProps,
  disabled,
  ...tagListProps
}) => {
  var _a, _b;
  const [draggedTagId, setDraggedTagId] = React.useState(null);
  const handleMouseDown = (id) => {
    setDraggedTagId(id);
  };
  const handleMouseUp = () => {
    setDraggedTagId(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: !inlineTags ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "rounded-md w-full",
        // className,
        {
          "flex flex-wrap gap-2": direction === "row",
          "flex flex-col gap-2": direction === "column"
        },
        (_a = classStyleProps == null ? void 0 : classStyleProps.tagListClasses) == null ? void 0 : _a.container
      ),
      children: draggable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        SortableList,
        {
          onSortEnd,
          className: `flex flex-wrap gap-2 list ${(_b = classStyleProps == null ? void 0 : classStyleProps.tagListClasses) == null ? void 0 : _b.sortableList}`,
          dropTarget: /* @__PURE__ */ jsxRuntimeExports.jsx(DropTarget, {}),
          children: tags.map((tagObj, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(SortableItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              onMouseDown: () => handleMouseDown(tagObj.id),
              onMouseLeave: handleMouseUp,
              className: cn(
                {
                  "border border-solid border-primary rounded-md": draggedTagId === tagObj.id
                },
                "transition-all duration-200 ease-in-out"
              ),
              children: customTagRenderer ? customTagRenderer(tagObj, index === activeTagIndex) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tag,
                {
                  tagObj,
                  isActiveTag: index === activeTagIndex,
                  direction,
                  draggable,
                  tagClasses: classStyleProps == null ? void 0 : classStyleProps.tagClasses,
                  ...tagListProps,
                  disabled
                }
              )
            }
          ) }, tagObj.id))
        }
      ) : tags.map(
        (tagObj, index) => customTagRenderer ? customTagRenderer(tagObj, index === activeTagIndex) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tag,
          {
            tagObj,
            isActiveTag: index === activeTagIndex,
            direction,
            draggable,
            tagClasses: classStyleProps == null ? void 0 : classStyleProps.tagClasses,
            ...tagListProps,
            disabled
          },
          tagObj.id
        )
      )
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: draggable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    SortableList,
    {
      onSortEnd,
      className: "flex flex-wrap gap-2 list",
      dropTarget: /* @__PURE__ */ jsxRuntimeExports.jsx(DropTarget, {}),
      children: tags.map((tagObj, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(SortableItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          onMouseDown: () => handleMouseDown(tagObj.id),
          onMouseLeave: handleMouseUp,
          className: cn(
            {
              "border border-solid border-primary rounded-md": draggedTagId === tagObj.id
            },
            "transition-all duration-200 ease-in-out"
          ),
          children: customTagRenderer ? customTagRenderer(tagObj, index === activeTagIndex) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tag,
            {
              tagObj,
              isActiveTag: index === activeTagIndex,
              direction,
              draggable,
              tagClasses: classStyleProps == null ? void 0 : classStyleProps.tagClasses,
              ...tagListProps,
              disabled
            }
          )
        }
      ) }, tagObj.id))
    }
  ) : tags.map(
    (tagObj, index) => customTagRenderer ? customTagRenderer(tagObj, index === activeTagIndex) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tag,
      {
        tagObj,
        isActiveTag: index === activeTagIndex,
        direction,
        draggable,
        tagClasses: classStyleProps == null ? void 0 : classStyleProps.tagClasses,
        ...tagListProps,
        disabled
      },
      tagObj.id
    )
  ) }) });
};
const TagPopover = ({
  children,
  tags,
  customTagRenderer,
  activeTagIndex,
  setActiveTagIndex,
  classStyleProps,
  disabled,
  usePortal,
  ...tagProps
}) => {
  var _a, _b;
  const triggerContainerRef = reactExports.useRef(null);
  const triggerRef = reactExports.useRef(null);
  const popoverContentRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const [popoverWidth, setPopoverWidth] = reactExports.useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = reactExports.useState(false);
  const [inputFocused, setInputFocused] = reactExports.useState(false);
  const [sideOffset, setSideOffset] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const handleResize = () => {
      var _a2;
      if (triggerContainerRef.current && triggerRef.current) {
        setPopoverWidth(triggerContainerRef.current.offsetWidth);
        setSideOffset(
          triggerContainerRef.current.offsetWidth - ((_a2 = triggerRef == null ? void 0 : triggerRef.current) == null ? void 0 : _a2.offsetWidth)
        );
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [triggerContainerRef, triggerRef]);
  reactExports.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isPopoverOpen && triggerContainerRef.current && popoverContentRef.current && !triggerContainerRef.current.contains(event.target) && !popoverContentRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPopoverOpen]);
  const handleOpenChange = reactExports.useCallback(
    (open) => {
      var _a2;
      if (open && triggerContainerRef.current) {
        setPopoverWidth(triggerContainerRef.current.offsetWidth);
      }
      if (open) {
        (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
        setIsPopoverOpen(open);
      }
    },
    [inputFocused]
  );
  const handleInputFocus = (event) => {
    if (isPopoverOpen) {
      setInputFocused(true);
    }
    const userOnFocus = children.props.onFocus;
    if (userOnFocus) userOnFocus(event);
  };
  const handleInputBlur = (event) => {
    setInputFocused(false);
    if (!isPopoverOpen) {
      setIsPopoverOpen(false);
    }
    const userOnBlur = children.props.onBlur;
    if (userOnBlur) userOnBlur(event);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Popover,
    {
      open: isPopoverOpen,
      onOpenChange: handleOpenChange,
      modal: usePortal,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative flex items-center rounded-md border border-input bg-transparent pr-3",
            ref: triggerContainerRef,
            children: [
              React.cloneElement(children, {
                onFocus: handleInputFocus,
                onBlur: handleInputBlur,
                ref: inputRef
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  ref: triggerRef,
                  variant: "ghost",
                  size: "icon",
                  role: "combobox",
                  className: cn(
                    `hover:bg-transparent`,
                    (_a = classStyleProps == null ? void 0 : classStyleProps.popoverClasses) == null ? void 0 : _a.popoverTrigger
                  ),
                  onClick: () => setIsPopoverOpen(!isPopoverOpen),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "svg",
                    {
                      xmlns: "http://www.w3.org/2000/svg",
                      width: "24",
                      height: "24",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      className: `lucide lucide-chevron-down h-4 w-4 shrink-0 opacity-50 ${isPopoverOpen ? "rotate-180" : "rotate-0"}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6 9 6 6 6-6" })
                    }
                  )
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          PopoverContent,
          {
            ref: popoverContentRef,
            className: cn(
              `w-full space-y-3`,
              (_b = classStyleProps == null ? void 0 : classStyleProps.popoverClasses) == null ? void 0 : _b.popoverContent
            ),
            style: {
              marginLeft: `-${sideOffset}px`,
              width: `${popoverWidth}px`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium leading-none", children: "Entered Tags" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foregrounsd text-left", children: "These are the tags you've entered." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TagList,
                {
                  tags,
                  customTagRenderer,
                  activeTagIndex,
                  setActiveTagIndex,
                  classStyleProps: {
                    tagListClasses: classStyleProps == null ? void 0 : classStyleProps.tagListClasses,
                    tagClasses: classStyleProps == null ? void 0 : classStyleProps.tagClasses
                  },
                  ...tagProps,
                  disabled
                }
              )
            ]
          }
        )
      ]
    }
  );
};
const Autocomplete = ({
  tags,
  setTags,
  setInputValue,
  setTagCount,
  autocompleteOptions,
  maxTags,
  onTagAdd,
  onTagRemove,
  allowDuplicates,
  inlineTags,
  children,
  classStyleProps,
  usePortal
}) => {
  const triggerContainerRef = reactExports.useRef(null);
  const triggerRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const popoverContentRef = reactExports.useRef(null);
  const [popoverWidth, setPopoverWidth] = reactExports.useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = reactExports.useState(false);
  const [inputFocused, setInputFocused] = reactExports.useState(false);
  const [popooverContentTop, setPopoverContentTop] = reactExports.useState(0);
  const [selectedIndex, setSelectedIndex] = reactExports.useState(-1);
  reactExports.useEffect(() => {
    var _a, _b;
    if (!triggerContainerRef.current || !triggerRef.current) return;
    setPopoverContentTop(
      ((_a = triggerContainerRef.current) == null ? void 0 : _a.getBoundingClientRect().bottom) - ((_b = triggerRef.current) == null ? void 0 : _b.getBoundingClientRect().bottom)
    );
  }, [tags]);
  reactExports.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isPopoverOpen && triggerContainerRef.current && popoverContentRef.current && !triggerContainerRef.current.contains(event.target) && !popoverContentRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPopoverOpen]);
  const handleOpenChange = reactExports.useCallback(
    (open) => {
      var _a;
      if (open && triggerContainerRef.current) {
        const { width } = triggerContainerRef.current.getBoundingClientRect();
        setPopoverWidth(width);
      }
      if (open) {
        (_a = inputRef.current) == null ? void 0 : _a.focus();
        setIsPopoverOpen(open);
      }
    },
    [inputFocused]
  );
  const handleInputFocus = (event) => {
    if (triggerContainerRef.current) {
      const { width } = triggerContainerRef.current.getBoundingClientRect();
      setPopoverWidth(width);
      setIsPopoverOpen(true);
    }
    if (isPopoverOpen) {
      setInputFocused(true);
    }
    const userOnFocus = children.props.onFocus;
    if (userOnFocus) userOnFocus(event);
  };
  const handleInputBlur = (event) => {
    setInputFocused(false);
    if (!isPopoverOpen) {
      setIsPopoverOpen(false);
    }
    const userOnBlur = children.props.onBlur;
    if (userOnBlur) userOnBlur(event);
  };
  const handleKeyDown = (event) => {
    if (!isPopoverOpen) return;
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex(
          (prevIndex) => prevIndex <= 0 ? autocompleteOptions.length - 1 : prevIndex - 1
        );
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex(
          (prevIndex) => prevIndex === autocompleteOptions.length - 1 ? 0 : prevIndex + 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex !== -1) {
          toggleTag(autocompleteOptions[selectedIndex]);
          setSelectedIndex(-1);
        }
        break;
    }
  };
  const toggleTag = (option) => {
    const index = tags.findIndex((tag) => tag.text === option.text);
    if (index >= 0) {
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);
      setTagCount((prevCount) => prevCount - 1);
      if (onTagRemove) {
        onTagRemove(option.text);
      }
    } else {
      if (!allowDuplicates && tags.some((tag) => tag.text === option.text)) {
        return;
      }
      if (!maxTags || tags.length < maxTags) {
        setTags([...tags, option]);
        setTagCount((prevCount) => prevCount + 1);
        setInputValue("");
        if (onTagAdd) {
          onTagAdd(option.text);
        }
      }
    }
    setSelectedIndex(-1);
  };
  const childrenWithProps = React.cloneElement(
    children,
    {
      onKeyDown: handleKeyDown,
      onFocus: handleInputFocus,
      onBlur: handleInputBlur,
      ref: inputRef
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        classStyleProps == null ? void 0 : classStyleProps.command
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Popover,
        {
          open: isPopoverOpen,
          onOpenChange: handleOpenChange,
          modal: usePortal,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "relative h-full flex items-center rounded-md border bg-transparent pr-3",
                ref: triggerContainerRef,
                children: [
                  childrenWithProps,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, ref: triggerRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      role: "combobox",
                      className: cn(
                        `hover:bg-transparent ${!inlineTags ? "ml-auto" : ""}`,
                        classStyleProps == null ? void 0 : classStyleProps.popoverTrigger
                      ),
                      onClick: () => {
                        setIsPopoverOpen(!isPopoverOpen);
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "svg",
                        {
                          xmlns: "http://www.w3.org/2000/svg",
                          width: "24",
                          height: "24",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          className: `lucide lucide-chevron-down h-4 w-4 shrink-0 opacity-50 ${isPopoverOpen ? "rotate-180" : "rotate-0"}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6 9 6 6 6-6" })
                        }
                      )
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PopoverContent,
              {
                ref: popoverContentRef,
                side: "bottom",
                align: "start",
                forceMount: true,
                className: cn(`p-0 relative`, classStyleProps == null ? void 0 : classStyleProps.popoverContent),
                style: {
                  top: `${popooverContentTop}px`,
                  marginLeft: `calc(-${popoverWidth}px + 36px)`,
                  width: `${popoverWidth}px`,
                  minWidth: `${popoverWidth}px`,
                  zIndex: 9999
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "max-h-[300px] overflow-y-auto overflow-x-hidden",
                      classStyleProps == null ? void 0 : classStyleProps.commandList
                    ),
                    style: {
                      minHeight: "68px"
                    },
                    children: autocompleteOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        role: "group",
                        className: cn(
                          "overflow-y-auto overflow-hidden p-1 text-foreground",
                          classStyleProps == null ? void 0 : classStyleProps.commandGroup
                        ),
                        style: {
                          minHeight: "68px"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-medium text-sm py-1.5 px-2 pb-2", children: "Suggestions" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "separator", className: "py-0.5" }),
                          autocompleteOptions.map((option, index) => {
                            const isSelected = index === selectedIndex;
                            return /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              {
                                role: "option",
                                "aria-selected": isSelected,
                                className: cn(
                                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent",
                                  isSelected && "bg-accent text-accent-foreground",
                                  classStyleProps == null ? void 0 : classStyleProps.commandItem
                                ),
                                "data-value": option.text,
                                onClick: () => toggleTag(option),
                                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex items-center gap-2", children: [
                                  option.text,
                                  tags.some((tag) => tag.text === option.text) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "svg",
                                    {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      width: "14",
                                      height: "14",
                                      viewBox: "0 0 24 24",
                                      fill: "none",
                                      stroke: "currentColor",
                                      strokeWidth: "2",
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round",
                                      className: "lucide lucide-check",
                                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6 9 17l-5-5" })
                                    }
                                  )
                                ] })
                              },
                              option.id
                            );
                          })
                        ]
                      },
                      autocompleteOptions.length
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 text-center text-sm", children: "No results found." })
                  },
                  autocompleteOptions.length
                )
              }
            )
          ]
        }
      )
    }
  );
};
function uuid() {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString();
}
const TagInput = React.forwardRef(
  (props, ref) => {
    var _a, _b, _c, _d, _e, _f;
    const {
      id,
      placeholder,
      tags,
      setTags,
      variant,
      size,
      shape,
      enableAutocomplete,
      autocompleteOptions,
      maxTags,
      delimiter = ",",
      onTagAdd,
      onTagRemove,
      allowDuplicates,
      showCount,
      validateTag,
      placeholderWhenFull = "Max tags reached",
      sortTags,
      delimiterList,
      truncate,
      autocompleteFilter,
      borderStyle,
      textCase,
      interaction,
      animation,
      textStyle,
      minLength,
      maxLength,
      direction = "row",
      onInputChange,
      customTagRenderer,
      onFocus,
      onBlur,
      onTagClick,
      draggable = false,
      inputFieldPosition = "bottom",
      clearAll = false,
      onClearAll,
      usePopoverForTags = false,
      inputProps = {},
      restrictTagsToAutocompleteOptions,
      inlineTags = true,
      addTagsOnBlur = false,
      activeTagIndex,
      setActiveTagIndex,
      styleClasses = {},
      disabled = false,
      usePortal = false,
      addOnPaste = false,
      generateTagId = uuid
    } = props;
    const [inputValue, setInputValue] = React.useState("");
    const [tagCount, setTagCount] = React.useState(Math.max(0, tags.length));
    const inputRef = React.useRef(null);
    if (maxTags !== void 0 && maxTags < 0 || props.minTags !== void 0 && props.minTags < 0) {
      console.warn("maxTags and minTags cannot be less than 0");
      return null;
    }
    const handleInputChange = (e) => {
      const newValue = e.target.value;
      let processed = false;
      const addTag = (value) => {
        const newTagId = generateTagId();
        if (allowDuplicates || !tags.some((tag) => tag.text === value)) {
          if (maxTags === void 0 || tags.length < maxTags) {
            const newTag = { id: newTagId, text: value };
            setTags((prevTags) => [...prevTags ?? [], newTag]);
            onTagAdd == null ? void 0 : onTagAdd(value);
          } else {
            console.warn("Reached the maximum number of tags allowed");
          }
        } else {
          console.warn(`Duplicate tag "${value}" not added`);
        }
      };
      if (addOnPaste && newValue.includes(delimiter)) {
        const splitValues = newValue.split(delimiter).map((v) => v.trim()).filter((v) => v);
        splitValues.forEach((value) => {
          if (!value) return;
          const newTagText = value.trim();
          if (restrictTagsToAutocompleteOptions && !(autocompleteOptions == null ? void 0 : autocompleteOptions.some((option) => option.text === newTagText))) {
            console.warn("Tag not allowed as per autocomplete options");
            return;
          }
          if (validateTag && !validateTag(newTagText)) {
            console.warn("Invalid tag as per validateTag");
            return;
          }
          if (minLength && newTagText.length < minLength) {
            console.warn(`Tag "${newTagText}" is too short`);
            return;
          }
          if (maxLength && newTagText.length > maxLength) {
            console.warn(`Tag "${newTagText}" is too long`);
            return;
          }
          addTag(newTagText);
        });
        setInputValue("");
        processed = true;
      }
      if (addOnPaste && validateTag) {
        const newTagText = newValue.trim();
        if (!processed && validateTag(newTagText)) {
          addTag(newTagText);
          setInputValue("");
          processed = true;
        }
      }
      if (!processed) {
        setInputValue(newValue);
      }
      onInputChange == null ? void 0 : onInputChange(newValue);
    };
    const handleInputFocus = (event) => {
      setActiveTagIndex(null);
      onFocus == null ? void 0 : onFocus(event);
    };
    const handleInputBlur = (event) => {
      if (addTagsOnBlur && inputValue.trim()) {
        const newTagText = inputValue.trim();
        if (validateTag && !validateTag(newTagText)) {
          return;
        }
        if (minLength && newTagText.length < minLength) {
          console.warn("Tag is too short");
          return;
        }
        if (maxLength && newTagText.length > maxLength) {
          console.warn("Tag is too long");
          return;
        }
        if ((allowDuplicates || !tags.some((tag) => tag.text === newTagText)) && (maxTags === void 0 || tags.length < maxTags)) {
          const newTagId = generateTagId();
          setTags([...tags, { id: newTagId, text: newTagText }]);
          onTagAdd == null ? void 0 : onTagAdd(newTagText);
          setTagCount((prevTagCount) => prevTagCount + 1);
          setInputValue("");
        }
      }
      onBlur == null ? void 0 : onBlur(event);
    };
    const handleKeyDown = (e) => {
      if (delimiterList ? delimiterList.includes(e.key) : e.key === delimiter || e.key === "Enter") {
        e.preventDefault();
        const newTagText = inputValue.trim();
        if (restrictTagsToAutocompleteOptions && !(autocompleteOptions == null ? void 0 : autocompleteOptions.some((option) => option.text === newTagText))) {
          return;
        }
        if (validateTag && !validateTag(newTagText)) {
          return;
        }
        if (minLength && newTagText.length < minLength) {
          console.warn("Tag is too short");
          return;
        }
        if (maxLength && newTagText.length > maxLength) {
          console.warn("Tag is too long");
          return;
        }
        const newTagId = generateTagId();
        if (newTagText && (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) && (maxTags === void 0 || tags.length < maxTags)) {
          setTags([...tags, { id: newTagId, text: newTagText }]);
          onTagAdd == null ? void 0 : onTagAdd(newTagText);
          setTagCount((prevTagCount) => prevTagCount + 1);
        }
        setInputValue("");
      } else {
        switch (e.key) {
          case "Delete":
            if (activeTagIndex !== null) {
              e.preventDefault();
              const newTags = [...tags];
              newTags.splice(activeTagIndex, 1);
              setTags(newTags);
              setActiveTagIndex(
                (prev) => newTags.length === 0 ? null : prev >= newTags.length ? newTags.length - 1 : prev
              );
              setTagCount((prevTagCount) => prevTagCount - 1);
              onTagRemove == null ? void 0 : onTagRemove(tags[activeTagIndex].text);
            }
            break;
          case "Backspace":
            if (activeTagIndex !== null) {
              e.preventDefault();
              const newTags = [...tags];
              newTags.splice(activeTagIndex, 1);
              setTags(newTags);
              setActiveTagIndex((prev) => prev === 0 ? null : prev - 1);
              setTagCount((prevTagCount) => prevTagCount - 1);
              onTagRemove == null ? void 0 : onTagRemove(tags[activeTagIndex].text);
            }
            break;
          case "ArrowRight":
            e.preventDefault();
            if (activeTagIndex === null) {
              setActiveTagIndex(0);
            } else {
              setActiveTagIndex(
                (prev) => prev + 1 >= tags.length ? 0 : prev + 1
              );
            }
            break;
          case "ArrowLeft":
            e.preventDefault();
            if (activeTagIndex === null) {
              setActiveTagIndex(tags.length - 1);
            } else {
              setActiveTagIndex(
                (prev) => prev === 0 ? tags.length - 1 : prev - 1
              );
            }
            break;
          case "Home":
            e.preventDefault();
            setActiveTagIndex(0);
            break;
          case "End":
            e.preventDefault();
            setActiveTagIndex(tags.length - 1);
            break;
        }
      }
    };
    const removeTag = (idToRemove) => {
      var _a2;
      setTags(tags.filter((tag) => tag.id !== idToRemove));
      onTagRemove == null ? void 0 : onTagRemove(((_a2 = tags.find((tag) => tag.id === idToRemove)) == null ? void 0 : _a2.text) || "");
      setTagCount((prevTagCount) => prevTagCount - 1);
    };
    const onSortEnd = (oldIndex, newIndex) => {
      setTags((currentTags) => {
        const newTags = [...currentTags];
        const [removedTag] = newTags.splice(oldIndex, 1);
        newTags.splice(newIndex, 0, removedTag);
        return newTags;
      });
    };
    const handleClearAll = () => {
      if (!onClearAll) {
        setActiveTagIndex(-1);
        setTags([]);
        return;
      }
      onClearAll == null ? void 0 : onClearAll();
    };
    const filteredAutocompleteOptions = reactExports.useMemo(() => {
      return (autocompleteOptions || []).filter(
        (option) => option.text.toLowerCase().includes(inputValue ? inputValue.toLowerCase() : "")
      );
    }, [inputValue, autocompleteOptions]);
    const displayedTags = sortTags ? [...tags].sort() : tags;
    const truncatedTags = truncate ? tags.map((tag) => {
      var _a2;
      return {
        id: tag.id,
        text: ((_a2 = tag.text) == null ? void 0 : _a2.length) > truncate ? `${tag.text.substring(0, truncate)}...` : tag.text
      };
    }) : displayedTags;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `w-full flex ${!inlineTags && tags.length > 0 ? "gap-3" : ""} ${inputFieldPosition === "bottom" ? "flex-col" : inputFieldPosition === "top" ? "flex-col-reverse" : "flex-row"}`,
        children: [
          !usePopoverForTags && (!inlineTags ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            TagList,
            {
              tags: truncatedTags,
              customTagRenderer,
              variant,
              size,
              shape,
              borderStyle,
              textCase,
              interaction,
              animation,
              textStyle,
              onTagClick,
              draggable,
              onSortEnd,
              onRemoveTag: removeTag,
              direction,
              inlineTags,
              activeTagIndex,
              setActiveTagIndex,
              classStyleProps: {
                tagListClasses: styleClasses == null ? void 0 : styleClasses.tagList,
                tagClasses: styleClasses == null ? void 0 : styleClasses.tag
              },
              disabled
            }
          ) : !enableAutocomplete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                `flex flex-row flex-wrap items-center gap-2 p-2 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                styleClasses == null ? void 0 : styleClasses.inlineTagsContainer
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TagList,
                  {
                    tags: truncatedTags,
                    customTagRenderer,
                    variant,
                    size,
                    shape,
                    borderStyle,
                    textCase,
                    interaction,
                    animation,
                    textStyle,
                    onTagClick,
                    draggable,
                    onSortEnd,
                    onRemoveTag: removeTag,
                    direction,
                    inlineTags,
                    activeTagIndex,
                    setActiveTagIndex,
                    classStyleProps: {
                      tagListClasses: styleClasses == null ? void 0 : styleClasses.tagList,
                      tagClasses: styleClasses == null ? void 0 : styleClasses.tag
                    },
                    disabled
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    ref: inputRef,
                    id,
                    type: "text",
                    placeholder: maxTags !== void 0 && tags.length >= maxTags ? placeholderWhenFull : placeholder,
                    value: inputValue,
                    onChange: handleInputChange,
                    onKeyDown: handleKeyDown,
                    onFocus: handleInputFocus,
                    onBlur: handleInputBlur,
                    ...inputProps,
                    className: cn(
                      "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                      // className,
                      styleClasses == null ? void 0 : styleClasses.input
                    ),
                    autoComplete: enableAutocomplete ? "on" : "off",
                    list: enableAutocomplete ? "autocomplete-options" : void 0,
                    disabled: disabled || maxTags !== void 0 && tags.length >= maxTags
                  }
                )
              ]
            }
          ) })),
          enableAutocomplete ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Autocomplete,
            {
              tags,
              setTags,
              setInputValue,
              autocompleteOptions: filteredAutocompleteOptions,
              setTagCount,
              maxTags,
              onTagAdd,
              onTagRemove,
              allowDuplicates: allowDuplicates ?? false,
              inlineTags,
              usePortal,
              classStyleProps: {
                command: (_a = styleClasses == null ? void 0 : styleClasses.autoComplete) == null ? void 0 : _a.command,
                popoverTrigger: (_b = styleClasses == null ? void 0 : styleClasses.autoComplete) == null ? void 0 : _b.popoverTrigger,
                popoverContent: (_c = styleClasses == null ? void 0 : styleClasses.autoComplete) == null ? void 0 : _c.popoverContent,
                commandList: (_d = styleClasses == null ? void 0 : styleClasses.autoComplete) == null ? void 0 : _d.commandList,
                commandGroup: (_e = styleClasses == null ? void 0 : styleClasses.autoComplete) == null ? void 0 : _e.commandGroup,
                commandItem: (_f = styleClasses == null ? void 0 : styleClasses.autoComplete) == null ? void 0 : _f.commandItem
              },
              children: !usePopoverForTags ? !inlineTags ? (
                // <CommandInput
                //   placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                //   ref={inputRef}
                //   value={inputValue}
                //   disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                //   onChangeCapture={handleInputChange}
                //   onKeyDown={handleKeyDown}
                //   onFocus={handleInputFocus}
                //   onBlur={handleInputBlur}
                //   className={cn(
                //     'w-full',
                //     // className,
                //     styleClasses?.input,
                //   )}
                // />
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    ref: inputRef,
                    id,
                    type: "text",
                    placeholder: maxTags !== void 0 && tags.length >= maxTags ? placeholderWhenFull : placeholder,
                    value: inputValue,
                    onChange: handleInputChange,
                    onKeyDown: handleKeyDown,
                    onFocus: handleInputFocus,
                    onBlur: handleInputBlur,
                    ...inputProps,
                    className: cn(
                      "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                      // className,
                      styleClasses == null ? void 0 : styleClasses.input
                    ),
                    autoComplete: enableAutocomplete ? "on" : "off",
                    list: enableAutocomplete ? "autocomplete-options" : void 0,
                    disabled: disabled || maxTags !== void 0 && tags.length >= maxTags
                  }
                )
              ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: cn(
                    `flex flex-row flex-wrap items-center p-2 gap-2 h-fit w-full bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                    styleClasses == null ? void 0 : styleClasses.inlineTagsContainer
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TagList,
                      {
                        tags: truncatedTags,
                        customTagRenderer,
                        variant,
                        size,
                        shape,
                        borderStyle,
                        textCase,
                        interaction,
                        animation,
                        textStyle,
                        onTagClick,
                        draggable,
                        onSortEnd,
                        onRemoveTag: removeTag,
                        direction,
                        inlineTags,
                        activeTagIndex,
                        setActiveTagIndex,
                        classStyleProps: {
                          tagListClasses: styleClasses == null ? void 0 : styleClasses.tagList,
                          tagClasses: styleClasses == null ? void 0 : styleClasses.tag
                        },
                        disabled
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        ref: inputRef,
                        id,
                        type: "text",
                        placeholder: maxTags !== void 0 && tags.length >= maxTags ? placeholderWhenFull : placeholder,
                        value: inputValue,
                        onChange: handleInputChange,
                        onKeyDown: handleKeyDown,
                        onFocus: handleInputFocus,
                        onBlur: handleInputBlur,
                        ...inputProps,
                        className: cn(
                          "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                          // className,
                          styleClasses == null ? void 0 : styleClasses.input
                        ),
                        autoComplete: enableAutocomplete ? "on" : "off",
                        list: enableAutocomplete ? "autocomplete-options" : void 0,
                        disabled: disabled || maxTags !== void 0 && tags.length >= maxTags
                      }
                    )
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                TagPopover,
                {
                  tags: truncatedTags,
                  customTagRenderer,
                  variant,
                  size,
                  shape,
                  borderStyle,
                  textCase,
                  interaction,
                  animation,
                  textStyle,
                  onTagClick,
                  draggable,
                  onSortEnd,
                  onRemoveTag: removeTag,
                  direction,
                  activeTagIndex,
                  setActiveTagIndex,
                  classStyleProps: {
                    popoverClasses: styleClasses == null ? void 0 : styleClasses.tagPopover,
                    tagListClasses: styleClasses == null ? void 0 : styleClasses.tagList,
                    tagClasses: styleClasses == null ? void 0 : styleClasses.tag
                  },
                  disabled,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      ref: inputRef,
                      id,
                      type: "text",
                      placeholder: maxTags !== void 0 && tags.length >= maxTags ? placeholderWhenFull : placeholder,
                      value: inputValue,
                      onChange: handleInputChange,
                      onKeyDown: handleKeyDown,
                      onFocus: handleInputFocus,
                      onBlur: handleInputBlur,
                      ...inputProps,
                      className: cn(
                        "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                        // className,
                        styleClasses == null ? void 0 : styleClasses.input
                      ),
                      autoComplete: enableAutocomplete ? "on" : "off",
                      list: enableAutocomplete ? "autocomplete-options" : void 0,
                      disabled: disabled || maxTags !== void 0 && tags.length >= maxTags
                    }
                  )
                }
              )
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: !usePopoverForTags ? !inlineTags ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ref: inputRef,
              id,
              type: "text",
              placeholder: maxTags !== void 0 && tags.length >= maxTags ? placeholderWhenFull : placeholder,
              value: inputValue,
              onChange: handleInputChange,
              onKeyDown: handleKeyDown,
              onFocus: handleInputFocus,
              onBlur: handleInputBlur,
              ...inputProps,
              className: cn(
                styleClasses == null ? void 0 : styleClasses.input
                // className
              ),
              autoComplete: enableAutocomplete ? "on" : "off",
              list: enableAutocomplete ? "autocomplete-options" : void 0,
              disabled: disabled || maxTags !== void 0 && tags.length >= maxTags
            }
          ) : null : /* @__PURE__ */ jsxRuntimeExports.jsx(
            TagPopover,
            {
              tags: truncatedTags,
              customTagRenderer,
              variant,
              size,
              shape,
              borderStyle,
              textCase,
              interaction,
              animation,
              textStyle,
              onTagClick,
              draggable,
              onSortEnd,
              onRemoveTag: removeTag,
              direction,
              activeTagIndex,
              setActiveTagIndex,
              classStyleProps: {
                popoverClasses: styleClasses == null ? void 0 : styleClasses.tagPopover,
                tagListClasses: styleClasses == null ? void 0 : styleClasses.tagList,
                tagClasses: styleClasses == null ? void 0 : styleClasses.tag
              },
              disabled,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  ref: inputRef,
                  id,
                  type: "text",
                  placeholder: maxTags !== void 0 && tags.length >= maxTags ? placeholderWhenFull : placeholder,
                  value: inputValue,
                  onChange: handleInputChange,
                  onKeyDown: handleKeyDown,
                  onFocus: handleInputFocus,
                  onBlur: handleInputBlur,
                  ...inputProps,
                  autoComplete: enableAutocomplete ? "on" : "off",
                  list: enableAutocomplete ? "autocomplete-options" : void 0,
                  disabled: disabled || maxTags !== void 0 && tags.length >= maxTags,
                  className: cn(
                    "border-0 w-full",
                    styleClasses == null ? void 0 : styleClasses.input
                    // className
                  )
                }
              )
            }
          ) }),
          showCount && maxTags && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-sm mt-1 ml-auto", children: [
            `${tagCount}`,
            "/",
            `${maxTags}`
          ] }) }),
          clearAll && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              onClick: handleClearAll,
              className: cn("mt-2", styleClasses == null ? void 0 : styleClasses.clearAllButton),
              children: "Clear All"
            }
          )
        ]
      }
    );
  }
);
TagInput.displayName = "TagInput";
const formSchema = objectType({
  cid: arrayType(
    objectType({
      id: stringType(),
      text: stringType()
    })
  )
});
function PinDialog({
  open,
  stateChange
}) {
  const svc = useActiveService();
  const [tags, setTags] = reactExports.useState([]);
  const form = xe({
    modalProps: {
      defaultVisible: open
    },
    //   warnWhenUnsavedChanges: true,
    resolver: t(formSchema),
    refineCoreProps: {
      resource: svc == null ? void 0 : svc.id(),
      action: "create",
      successNotification(data) {
        return {
          message: "CID(s) pinned successfully",
          type: "success"
        };
      },
      errorNotification(error) {
        return {
          message: "Error pinning CID",
          description: error == null ? void 0 : error.message,
          type: "error"
        };
      }
    }
  });
  const {
    setValue,
    saveButtonProps,
    modal: { visible, close, show }
  } = form;
  const reset = () => {
    form.reset();
    setTags([]);
  };
  const doStateChange = (open2) => {
    if (!open2) {
      reset();
    }
    open2 ? show() : close();
    stateChange(open2);
  };
  reactExports.useEffect(() => {
    open ? show() : close();
  }, [open]);
  reactExports.useEffect(() => {
    form.refineCore.mutation.status === "success" && doStateChange(false);
  }, [form.refineCore.mutation.status]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: visible, onOpenChange: doStateChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Pin CID" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Pin one or more CIDs to your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { ...form, children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      FormField,
      {
        control: form.control,
        name: "cid",
        render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TagInput,
            {
              addOnPaste: true,
              direction: "row",
              inputFieldPosition: "top",
              activeTagIndex: null,
              styleClasses: {
                input: "order-first w-full",
                tagList: {
                  container: "flex flex-wrap"
                }
              },
              setActiveTagIndex: function(value) {
              },
              ...field,
              placeholder: "Enter a CID",
              tags,
              className: "sm:min-w-[450px]",
              setTags: (newTags) => {
                setTags(newTags);
                setValue("cid", newTags == null ? void 0 : newTags());
              },
              validateTag: (tag) => svc.validateCid(tag)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormMessage, {})
        ] })
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { ...saveButtonProps, children: "Pin" }) })
  ] }) });
}
function UnverifiedUserModal({
  isOpen,
  onClose
}) {
  const emailVerification = useEmailVerification();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Account Verification Required" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border-l-4 border-amber-400 rounded-lg shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      VerificationNoticeContent,
      {
        emailVerification,
        className: "p-4"
      }
    ) }) })
  ] }) });
}
function Service() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(mc, {
    v3LegacyAuthProviderCompatible: false,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralLayout, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileManager, {})
    })
  }, "service");
}
const FileManager = () => {
  var _a;
  const svc = useActiveService();
  const go = Le();
  const [showPinDialog, setShowPinDialog] = reactExports.useState(false);
  const parsed = Te();
  const nav = Pe();
  const [searchParams, setSearchParams] = useSearchParams();
  const [folderCid, setFolderCid] = reactExports.useState();
  const [currentPath, setCurrentPath] = reactExports.useState([]);
  const [showVerificationModal, setShowVerificationModal] = reactExports.useState(false);
  const breadcrumbHook = svc == null ? void 0 : svc.UIFileManagerCurrentBreadcrumbPathHook();
  const navigateToCID = svc == null ? void 0 : svc.UINavigateToCIDHook();
  const user = oo();
  reactExports.useEffect(() => {
    if (!svc) {
      go({
        to: "/dashboard"
      });
    }
  }, [svc, go]);
  reactExports.useEffect(() => {
    var _a2, _b;
    if (!parsed.id) {
      return;
    }
    if (((_a2 = parsed.resource) == null ? void 0 : _a2.name) !== IPFS_SUBFOLDER_ROUTE) {
      setFolderCid(void 0);
      setCurrentPath([]);
      return;
    }
    try {
      CID.parse(parsed == null ? void 0 : parsed.id);
    } catch (e) {
      nav.list(svc == null ? void 0 : svc.id());
      return;
    }
    setFolderCid(parsed.id);
    (_b = breadcrumbHook == null ? void 0 : breadcrumbHook()) == null ? void 0 : _b.then((path) => {
      setCurrentPath(path);
    });
  }, [parsed.id]);
  const searchQuery = reactExports.useMemo(() => searchParams.get("q") || "", [searchParams]);
  const handleSearchChange = reactExports.useCallback((value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set("q", value);
      } else {
        newParams.delete("q");
      }
      return newParams;
    }, {
      replace: true
    });
  }, [setSearchParams]);
  const clearSearch = reactExports.useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);
  const navigateToBreadcrumb = reactExports.useCallback((index) => {
    if (index === -1) {
      console.log(nav.showUrl(SERVICE_ROUTE, svc == null ? void 0 : svc.id()));
      nav.show(SERVICE_ROUTE, svc == null ? void 0 : svc.id());
      return;
    }
    const cid = currentPath[index].cid;
    navigateToCID == null ? void 0 : navigateToCID(cid);
  }, [nav, svc, currentPath, navigateToCID]);
  const handlePinContent = reactExports.useCallback(() => {
    var _a2;
    if (!user.isLoading && ((_a2 = user.data) == null ? void 0 : _a2.verified)) {
      setShowPinDialog(true);
    } else {
      setShowVerificationModal(true);
    }
  }, [user.isLoading, (_a = user.data) == null ? void 0 : _a.verified]);
  if (!svc) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
      className: "font-bold text-l mt-8",
      children: "Files"
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "flex items-center space-x-4 my-6 w-full",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
        fullWidth: true,
        leftIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, {}),
        value: searchQuery,
        after: searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          variant: "ghost",
          size: "sm",
          className: "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0",
          onClick: clearSearch,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, {
            className: "h-4 w-4"
          })
        }),
        placeholder: "Search files by name or CID",
        className: "border-ring font-medium w-full grow h-12 flex-1 bg-primary-2/10",
        onChange: (e) => handleSearchChange(e.target.value)
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
        className: "h-12 gap-x-2",
        onClick: handlePinContent,
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Pin Content"]
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("nav", {
      className: "flex mb-4 overflow-x-auto",
      "aria-label": "Breadcrumb",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", {
        className: "inline-flex items-center space-x-1 md:space-x-3",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("li", {
          className: "inline-flex items-center",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            variant: "link",
            className: "inline-flex items-center text-sm font-medium",
            onClick: () => navigateToBreadcrumb(-1),
            children: "Home"
          })
        }), currentPath.map((folder, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", {
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
            className: "flex items-center",
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, {
              className: "w-5 h-5 text-gray-400"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
              variant: "link",
              className: "ml-1 text-sm font-medium",
              onClick: () => navigateToBreadcrumb(index),
              children: folder.name
            })]
          })
        }, folder.cid.toString()))]
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, {
      columns: svc.UIFileManagerColumns(),
      resource: svc.id(),
      dataProviderName: svc.id(),
      filters: [...svc == null ? void 0 : svc.UIGetSearchFilters(searchQuery)],
      permanentFilters: [{
        field: "status",
        value: "pinned",
        operator: "eq"
      }],
      meta: {
        fileManager: true,
        parentCid: folderCid
      }
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(PinDialog, {
      open: showPinDialog,
      stateChange: setShowPinDialog
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(UnverifiedUserModal, {
      isOpen: showVerificationModal,
      onClose: () => setShowVerificationModal(false)
    })]
  });
};
export {
  Service as default
};
