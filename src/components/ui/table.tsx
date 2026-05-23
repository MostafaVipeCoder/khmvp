"use client";


import { View, Text } from "../../tw";

import { cn } from "./utils";

function Table({ className, style, ...props }: any) {
  return (
    <View
      data-slot="table-container"
      className={cn("w-full", className)}
      style={style}
      {...props}
    />
  );
}

function TableHeader({ className, style, ...props }: any) {
  return (
    <View
      data-slot="table-header"
      className={cn("border-b border-border", className)}
      style={style}
      {...props}
    />
  );
}

function TableBody({ className, style, ...props }: any) {
  return (
    <View
      data-slot="table-body"
      className={className}
      style={style}
      {...props}
    />
  );
}

function TableFooter({ className, style, ...props }: any) {
  return (
    <View
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t border-border font-medium", className)}
      style={style}
      {...props}
    />
  );
}

function TableRow({ className, style, ...props }: any) {
  return (
    <View
      data-slot="table-row"
      className={cn("flex flex-row border-b border-border transition-colors", className)}
      style={style}
      {...props}
    />
  );
}

function TableHead({ className, style, ...props }: any) {
  return (
    <Text
      data-slot="table-head"
      className={cn("text-foreground h-10 px-2 font-medium flex-1", className)}
      style={style}
      {...props}
    />
  );
}

function TableCell({ className, style, ...props }: any) {
  return (
    <View
      data-slot="table-cell"
      className={cn("p-2 justify-center flex-1", className)}
      style={style}
      {...props}
    />
  );
}

function TableCaption({
  className,
  style,
  ...props
}: any) {
  return (
    <Text
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm text-center", className)}
      style={style}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
