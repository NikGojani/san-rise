import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			// San Rise Brand Colors
  			primary: {
  				DEFAULT: '#A86B22', // San Rise Gold
  				foreground: '#ffffff'
  			},
  			positive: {
  				DEFAULT: '#9BAE7A', // Olive
  				foreground: '#ffffff'
  			},
  			negative: {
  				DEFAULT: '#C26B48', // Clay
  				foreground: '#ffffff'
  			},
  			// Standard colors for compatibility
  			background: '#ffffff',
  			foreground: '#171717',
  			card: {
  				DEFAULT: '#ffffff',
  				foreground: '#171717'
  			},
  			popover: {
  				DEFAULT: '#ffffff',
  				foreground: '#171717'
  			},
  			secondary: {
  				DEFAULT: '#f5f5f5',
  				foreground: '#171717'
  			},
  			muted: {
  				DEFAULT: '#f5f5f5',
  				foreground: '#737373'
  			},
  			accent: {
  				DEFAULT: '#f5f5f5',
  				foreground: '#171717'
  			},
  			destructive: {
  				DEFAULT: '#ef4444',
  				foreground: '#ffffff'
  			},
  			neutral: {
  				DEFAULT: '#f5f5f5',
  				foreground: '#171717'
  			},
  			border: '#e5e5e5',
  			input: '#e5e5e5',
  			ring: '#A86B22',
  			chart: {
  				'1': '#A86B22',
  				'2': '#9BAE7A',
  				'3': '#C26B48',
  				'4': '#8B5CF6',
  				'5': '#06B6D4'
  			},
  			sidebar: {
  				DEFAULT: '#1f2937',
  				foreground: '#ffffff',
  				primary: '#A86B22',
  				'primary-foreground': '#ffffff',
  				accent: '#374151',
  				'accent-foreground': '#ffffff',
  				border: '#374151',
  				ring: '#A86B22'
  			}
  		},
  		borderRadius: {
  			lg: '0.5rem',
  			md: '0.375rem',
  			sm: '0.25rem'
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
  plugins: [require("tailwindcss-animate")],
};
export default config;
