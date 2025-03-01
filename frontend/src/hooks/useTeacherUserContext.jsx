import { TeacherUserContext } from '../context/teacherUserContext'
import { useContext } from 'react'

export const useTeacherUserContext = () => {
    const context = useContext(TeacherUserContext)

    if(!context){
        throw Error('useTeacherUserContext must be inside an TeacherUserContextProvider')
    }

    return context
}