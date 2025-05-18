import { UserDataContext } from '../context/userDataContext'
import { useContext } from 'react'

export const useUsersDataContext = () => {
    const context = useContext(UserDataContext)

    if(!context){
        throw Error('useUsersDataContext must be inside an UserDataContextProvider')
    }

    return context
}