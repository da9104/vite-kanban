import LandingPage from '@/components/LandingPage'
import { NavBar } from '@/components/ui/NavBar'

export default function Login() {


    return (
        <>
         <NavBar />
            <section className="flex min-h-screen flex-col p-8! w-full">
              <LandingPage />                
            </section>
        </>
    )
}