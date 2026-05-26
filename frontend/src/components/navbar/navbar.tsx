import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const Logo = '/dark1-logo.svg';

const Navbar = () => {
  const selector = useSelector((state: RootState) => state.auth);
  const user = selector.user;

  // Utility to get initials fallback if no avatar
  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  return (
    <div className="flex min-h-[10vh] justify-between items-center px-4 w-full bg-background shadow-md fixed top-0 left-0 right-0 z-50">
      <Link to={"/"} className="flex flex-row gap-1 items-center">
        <img src={Logo} alt="logo" className="w-10 h-10 object-contain" />
        <h1 className="text-xl font-semibold text-foreground tracking-tight">StudyApp</h1>
      </Link>

      <main className="flex items-center gap-3">
        {user ? (
          // Show avatar + username when logged in
          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold select-none">
                {getInitials(user.name)}
              </div>
            )}
            <span className="text-foreground hidden sm:inline">{user.name}</span>
          </Link>
        ) : (
          <>
            <Button variant={"outline"} size={"sm"} asChild>
              <Link to={"/sign-in"}>Login</Link>
            </Button>
            <Button variant={"default"} size={"sm"} asChild>
              <Link to={"/sign-up"}>Get Started</Link>
            </Button>
          </>
        )}
      </main>
    </div>
  );
};

export default Navbar;
