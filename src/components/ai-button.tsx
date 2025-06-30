'use client';
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AiButtonProps extends ButtonProps {
  isLoggedIn: boolean;
  loading?: boolean;
}

export function AiButton({ isLoggedIn, loading, children, className, disabled, ...props }: AiButtonProps) {
  const isEffectivelyDisabled = disabled || loading || !isLoggedIn;

  const buttonContent = (
    <>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  const button = (
    <Button disabled={isEffectivelyDisabled} className={cn("w-full justify-center", className)} {...props}>
      {buttonContent}
    </Button>
  );

  if (isLoggedIn) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">{button}</div> 
        </TooltipTrigger>
        <TooltipContent>
          <p>Insira uma chave API para usar esta função.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
