import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { audioManager } from '../../audio/AudioManager';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}

export function Button({ variant = 'secondary', size = 'md', className, onClick, onMouseEnter, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    audioManager.playCue('buttonClick');
  };

  const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(event);
    audioManager.playCue('buttonHover');
  };

  return <button type="button" {...rest} className={classes} onClick={handleClick} onMouseEnter={handleMouseEnter} />;
}
