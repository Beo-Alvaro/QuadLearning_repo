import { StudentDataContext } from '../context/studentDataContext'
import { useContext } from 'react'

export const useStudentDataContext = () => {
    const context = useContext(StudentDataContext)

    if(!context){
        throw Error('useStudentDataContext must be inside an StudentDataContextProvider')
    }

    return context
}