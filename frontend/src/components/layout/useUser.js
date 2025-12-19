import {create} from 'zustand'

const useUser= create((set)=>({
    username:'', 
    role:'',
    password:'',
    setusername: (newUsername) => set({ username: newUsername }),
    setpassword: (newPassword) => set({ password: newPassword }),
    setrole: (newRole) => set({ role: newRole }),
}));

export default useUser;