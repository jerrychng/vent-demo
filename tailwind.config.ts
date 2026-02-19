import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: 'var(--primary)',
  			'primary-foreground': 'var(--primary-foreground)',
  			secondary: 'var(--secondary)',
  			'secondary-foreground': 'var(--secondary-foreground)',
  			destructive: 'var(--destructive)',
  			'destructive-foreground': 'var(--destructive-foreground)',
  			muted: 'var(--muted)',
  			'muted-foreground': 'var(--muted-foreground)',
  			accent: 'var(--accent)',
  			'accent-foreground': 'var(--accent-foreground)',
  			popover: 'var(--popover)',
  			'popover-foreground': 'var(--popover-foreground)',
  			card: 'var(--card)',
  			'card-foreground': 'var(--card-foreground)',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			'sidebar-foreground': 'var(--sidebar-foreground)',
  			'sidebar-primary': 'var(--sidebar-primary)',
  			'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
  			'sidebar-accent': 'var(--sidebar-accent)',
  			'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
  			'sidebar-border': 'var(--sidebar-border)',
  			'dark-primary': 'var(--color-dark-primary)',
  			'text-body': 'var(--color-text-body)',
  			'text-dark-gray': 'var(--color-text-dark-gray)',
  			'bg-background': 'var(--color-bg-bakground)',
  			'border-dark': 'var(--color-border-dark)',
  			'dark-accent': 'var(--color-dark-accent)',
  			subtle: 'var(--color-subtle)',
  			gray: 'var(--color-gray)',
  			'light-gray': 'var(--color-light-gray)',
  			'light-green': 'var(--color-light-green)',
  			'highlight-green': 'var(--color-highlight-green)',
  			'dark-green': 'var(--color-dark-green)',
  			orange: 'var(--color-orange)',
  			'highlight-orange': 'var(--color-highlight-orange)',
  			'light-orange': 'var(--color-light-orange)',
  			'highlight-red': 'var(--color-highlight-red)',
  			'light-red': 'var(--color-light-red)',
  			'dark-red': 'var(--color-dark-red)',
  			red: 'var(--color-red)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)'
  			],
  			'mont-light': [
  				'mont-light',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			],
  			'mont-regular': [
  				'mont-regular',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			],
  			'mont-semibold': [
  				'mont-semi-bold',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			],
  			'mont-bold': [
  				'mont-bold',
  				'Helvetica',
  				'Arial',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			DEFAULT: 'var(--radius)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssAnimate]
};

export default config;
