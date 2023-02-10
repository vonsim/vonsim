import { Popover, Portal } from "@headlessui/react";
import { Float, FloatProps } from "@headlessui-float/react";
import {
  createContext,
  createElement,
  forwardRef,
  ReactNode,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import type { Except } from "type-fest";

import { cn } from "@/ui/lib/utils";

type MenuContextValue = {
  current: string | null;
  open: (id: string) => void;
  close: () => void;
};
const MenuContext = createContext<MenuContextValue>({
  current: null,
  open: () => void 0,
  close: () => void 0,
});

export type MenuRootProps = Pick<FloatProps, "placement" | "shift" | "offset" | "strategy"> & {
  children: JSX.Element[];
};
export function MenuRoot(props: MenuRootProps) {
  return <Popover>{({ open }) => <MenuInnerRoot {...props} popoverIsOpen={open} />}</Popover>;
}

function MenuInnerRoot({
  popoverIsOpen,
  children,
  ...float
}: MenuRootProps & { popoverIsOpen: boolean }) {
  const [stack, setStack] = useState<string[]>([]);

  const current = stack.at(-1) || null;
  const open = (id: string) => setStack([...stack, id]);
  const close = () => setStack(stack.slice(0, -1));

  if (!popoverIsOpen && current !== null) {
    // wait a bit to avoid flickering
    setTimeout(() => setStack([]), 50);
  }

  return (
    <MenuContext.Provider value={{ current, open, close }}>
      <Float {...float}>{children}</Float>
    </MenuContext.Provider>
  );
}

// All the submenus are rendered in the same portal group,
// and they change their visibility based on the current menu.

export type MenuContentProps = { children?: ReactNode };
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(({ children }, ref) => {
  const container = useRef<HTMLDivElement>(null);
  const { current } = useContext(MenuContext);

  return (
    <Popover.Panel
      ref={ref}
      className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-100 bg-white p-1 text-slate-700 shadow-md"
    >
      <div ref={container} />

      <Portal.Group target={container}>
        <Portal as="div" className={current === null ? "block" : "hidden"}>
          {children}
        </Portal>
      </Portal.Group>
    </Popover.Panel>
  );
});
MenuContent.displayName = "MenuContent";

// #=========================================================================#
// # Components                                                              #
// #=========================================================================#

export type MenuTitleProps = { children?: ReactNode };
export function MenuTitle({ children }: MenuTitleProps) {
  const { current, close } = useContext(MenuContext);

  return (
    <div className="flex items-center px-2 py-1.5 text-sm font-semibold text-slate-900">
      {current && (
        <button
          className="mr-1 -ml-0.5 flex items-center justify-center rounded-full hover:bg-slate-100 focus:bg-slate-100"
          onClick={close}
        >
          <span className="icon-[carbon--chevron-left] h-5 w-5" />
        </button>
      )}
      {children}
    </div>
  );
}

export function MenuSeparator() {
  return <hr className="-mx-1 my-1 h-px border-none bg-slate-100" />;
}

export type MenuItemProps = {
  children?: ReactNode;
  disabled?: boolean;
  leading?: string;
  trailing?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
};
export function MenuItem({
  children,
  disabled = false,
  leading,
  trailing,
  href,
  external = false,
  onClick,
}: MenuItemProps) {
  if (href && onClick) {
    throw new Error("`href` and `onClick` are mutually exclusive");
  }

  const element = disabled ? "div" : href ? "a" : onClick ? "button" : "div";

  if (href && external && !trailing) {
    trailing = "icon-[carbon--launch]";
  }

  return createElement(
    element,
    {
      className: cn(
        "relative flex select-none items-center rounded-sm py-1.5 px-2 text-sm font-medium outline-none hover:bg-slate-100 focus:bg-slate-100 w-full",
        disabled && "pointer-events-none opacity-50 cursor-default",
      ),
      ...(element === "a"
        ? { href, target: external ? "_blank" : undefined, rel: "noreferrer" }
        : element === "button"
        ? { onClick }
        : {}),
    },
    <>
      <span className={cn("mr-2 h-4 w-4", leading)} />
      {children}
      {trailing && <span className={cn("ml-auto block h-4 w-4", trailing)} />}
    </>,
  );
}

export type MenuRadioProps<Option> = {
  value: Option;
  onChange: (value: Option) => void;
  options: Option[];
  getOptionLabel: (option: Option) => string;
} & Pick<MenuItemProps, "leading" | "disabled" | "children">;
export function MenuRadio<Options>({
  value,
  onChange,
  options,
  getOptionLabel,
  ...trigger
}: MenuRadioProps<Options>) {
  return (
    <Submenu>
      <SubmenuTrigger {...trigger} />
      <SubmenuContent>
        <MenuTitle>{trigger.children}</MenuTitle>
        <MenuSeparator />
        {options.map((option, i) => (
          <MenuItem
            key={i}
            leading={
              option === value
                ? "icon-[carbon--radio-button-checked]"
                : "icon-[carbon--radio-button]"
            }
            onClick={() => onChange(option)}
          >
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </SubmenuContent>
    </Submenu>
  );
}

// #=========================================================================#
// # Submenus                                                                #
// #=========================================================================#

const SubmenuIdContext = createContext<string | null>(null);

export type SubmenuProps = { children?: ReactNode };
export function Submenu({ children }: SubmenuProps) {
  const id = useId();

  return <SubmenuIdContext.Provider value={id}>{children}</SubmenuIdContext.Provider>;
}

export type SubmenuTriggerProps = Except<MenuItemProps, "href" | "onClick" | "trailing">;
export function SubmenuTrigger(props: SubmenuTriggerProps) {
  const id = useContext(SubmenuIdContext);
  const { open } = useContext(MenuContext);

  if (id === null) {
    throw new Error("SubmenuTrigger must be rendered inside a Submenu");
  }

  return <MenuItem {...props} trailing="icon-[carbon--chevron-right]" onClick={() => open(id)} />;
}

export type SubmenuContentProps = { children?: ReactNode };
export function SubmenuContent({ children }: SubmenuContentProps) {
  const id = useContext(SubmenuIdContext);
  const { current } = useContext(MenuContext);

  return (
    <Portal as="div" className={current === id ? "block" : "hidden"}>
      {children}
    </Portal>
  );
}

const Menu = Object.assign(MenuRoot, {
  Button: Popover.Button,
  Content: MenuContent,
  Title: MenuTitle,
  Separator: MenuSeparator,
  Item: MenuItem,
  Radio: MenuRadio,
  Submenu: Submenu,
  SubmenuTrigger: SubmenuTrigger,
  SubmenuContent: SubmenuContent,
});

export { Menu };
