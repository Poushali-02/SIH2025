export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ministry' | 'district' | 'forest' | 'ngo';
  department?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}
