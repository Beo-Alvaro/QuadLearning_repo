import { TeacherDataContext } from '../context/teacherDataContext'
import { useContext } from 'react'

export const useTeacherDataContext = () => {
    const context = useContext(TeacherDataContext)

    if(!context){
        throw Error('UseTeacherDataContext must be inside an TeacherDataContextProvider')
    }

    return context
}