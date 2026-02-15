import React from "react";
import Image from "next/image";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  buttonType?: "primary" | "secondary";
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event?: any) => void;
  iconPrefix?: string;
  iconSuffix?: string;
  disabled?: boolean;
  className?: string;
  onSubmit?: () => void;
  type?: "button" | "submit" | "reset";
}

const  Button = ({ buttonType = 'primary',iconPrefix, iconSuffix, type, onClick, onSubmit, disabled, 
  className, children }: ButtonProps) => {
    const primaryStyles = `bg-primary-1000 hover:bg-primary-1100 disabled:bg-[#FC8181] disabled:opacity-60 
    disabled:cursor-not-allowed`
    const secondaryStyles = `bg-transparent text-[#2B2D4A] border border-solid border-white-200 
      hover:bg-white-200 disabled:opacity-60 disabled:cursor-not-allowed`
  return (
    <button type={type} onClick={onClick} onSubmit={onSubmit} disabled={disabled} 
      className={`${className} flex items-center justify-center px-10 py-4 rounded-[12.5rem]
      transition duration-300 leading-normal cursor-pointer
      ${buttonType === 'primary' ? primaryStyles : secondaryStyles}`}
    >
      {iconPrefix && (
				<figure className={`relative w-6 h-6 mr-2.5`}>
					<Image src={iconPrefix} fill alt="" />
				</figure>
			)}
			{children}
			{iconSuffix && (
				<figure className={`relative w-6 h-6 ml-2.5`}>
					<Image src={iconSuffix} fill alt="" />
				</figure>
			)}
    </button>
  )
}

export default Button