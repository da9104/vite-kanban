import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import logo from '@/assets/logo-mobile.svg'
import { useAppContext } from '@/context/AuthProvider'

export const NavBar = () => {
    const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })
    const { username } = useAppContext();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }
    const handleLinkClick = (href: string) => {
        closeMobileMenu()
        const element = document.querySelector(href)
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
            })
        }
    }

    // @return
    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
        >
            <div className="max-w-7xl mx-auto! px-6!">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => handleLinkClick("#home")}
                            className="flex flex-row items-center text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200"
                            style={{
                                fontFamily: "Plus Jakarta Sans, sans-serif",
                            }}
                        >
                            <img className="logo w-fit h-fit mr-4!" src={logo} alt="logo" />
                            {isDesktop && <h3 className="logo-text">kanban</h3>}{" "}
                        </button>
                    </div>

                    <button
                        className="hover:bg-[#635fc7]! hover:text-white!"
                        style={{
                            marginRight: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 18px',
                            backgroundColor: '#fff',
                            color: '#635fc7',
                            border: '1px solid',
                            borderColor: '#635fc7',
                            borderRadius: '25px',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                        onClick={() =>
                            supabase.auth.signInWithOAuth({
                                provider: "google",
                                options: {
                                    redirectTo: 'https://vite-kanban.vercel.app/api/auth/callback',
                                },
                            })
                        }
                    >
                        {/* Google logo */}
                        <div className="w-4 h-4 relative mr-2!">
                            <svg viewBox="0 0 24 24" className="w-full h-full">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        </div>
                        Sign in with Google
                    </button>

                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-foreground hover:text-primary p-2 rounded-md transition-colors duration-200"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                        }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                        className="md:hidden bg-background/95 backdrop-blur-md border-t border-border"
                    >
                        <div className="px-6 py-6 space-y-4">

                            <p className="text-center text-sm p-10 leading-9 ">Welcome! {username} Please sign in to manage your tasks.</p>
                            <div className="pt-4 border-t border-border">
                              
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
