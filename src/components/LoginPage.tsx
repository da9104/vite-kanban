import LandingPage from '@/components/LandingPage'
import { NavBar } from '@/components/ui/NavBar'

export default function Login() {


    return (
        <>
         <NavBar />
            <main className="flex min-h-screen flex-col items-center justify-center">
                <div className="w-full max-w-lg space-y-8 flex flex-col gap-2 items-center animate-[fade-in_0.5s_ease-in-out]">
                    <LandingPage />

                   
                    {/* <div className="w-full mt-8">{user ? <WelcomeMessage user={user} /> : <LoginButton />}</div> */}
                </div>
            </main >
        </>
    )
}