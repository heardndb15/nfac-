'use client';

export interface User {
  username: string;
  password?: string;
  agentId: string;
  createdAt: number;
}

export const authStore = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem('chess_exe_users');
    return users ? JSON.parse(users) : [];
  },

  register: (username: string, password?: string): User | null => {
    const users = authStore.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return null;
    }

    const newUser: User = {
      username,
      password, // In a real app we'd hash this, but this is "local" and for a hackathon
      agentId: `AGENT_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: Date.now(),
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('chess_exe_users', JSON.stringify(updatedUsers));
    return newUser;
  },

  login: (username: string, password?: string): User | null => {
    const users = authStore.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    return user || null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('chess_exe_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('chess_exe_profile');
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const profile = localStorage.getItem('chess_exe_profile');
    return profile ? JSON.parse(profile) : null;
  }
};
