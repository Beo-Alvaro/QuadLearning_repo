import { GradeDataContext } from '../context/gradeDataContext'
import { useContext } from 'react'

export const useGradeDataContext = () => {
    const context = useContext(GradeDataContext)

    if(!context){
        throw Error('useGradeDataContext must be inside an GradeDataContextProvider')
    }

    return context
}