interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}
