import logo from '../../assets/logo/brewnal-logo.png'
import logoDark from '../../assets/logo/brewnal-logo-dark.png'

interface LogoProps {
  className?: string
}

export function Logo({ className = 'h-8' }: LogoProps) {
  return (
    <>
      <img src={logo} alt="Brewnal" width={473} height={160} className={`${className} w-auto dark:hidden`} />
      <img src={logoDark} alt="Brewnal" width={473} height={160} className={`${className} w-auto hidden dark:block`} />
    </>
  )
}
