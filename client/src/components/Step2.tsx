import moment from 'moment'
import * as React from 'react'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
//
import { generateProject, getDownloads } from '../WebService'
import { downloadById } from '../WebService/downloadById'
import Spinner from './Spinner'

import fileDownload from 'js-file-download'

import { BsSend } from 'react-icons/bs'

interface ProjectFolder {
    directory: {
        createdAt: string;
    };
}

const Step2 = () => {
    const {
        yaml,
        prompt: initialPrompt,
        //
        projects,
        setProjects
    }: any = React.useContext(AppContext)

    const [prompt, setPrompt] = React.useState<string>('')

    const [gptRes, setGptRes] = React.useState<undefined | string>(undefined)

    // deprecated
    // const [selected, setSelected] = React.useState('nodejs-express-server')

    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
        getProjects()
    }, [])

    const getProjects = async () => {
        const res: any = await getDownloads()

        if (res?.error) {
            return
        }

        if (res?.data) {
            setProjects(res?.data)
        }
    }

    const download = async (fileId: string) => {
        setIsLoading(true)

        const res: any = await downloadById(fileId)

        if (res?.error) {
            toast('Error occured')
            setIsLoading(false)
            return
        }
        fileDownload(res?.data, `project_${fileId}.zip`);
        setIsLoading(false)
    }


    const submit = async (e: any) => {
        e.preventDefault()
        if (!yaml || !prompt) {
            toast("Please generate config before proceeding")
            return
        }

        setIsLoading(true)
        const data = {
            prompt,
            yaml,
            initialPrompt
            // language: selected
        }
        const res: any = await generateProject(data)

        if (res?.error) {

            setIsLoading(false)
            if (res?.error?.response?.data?.message) {
                setGptRes(res?.error?.response?.data?.message)
            }
            toast('Error occured')
            return
        }


        setIsLoading(false)
        setGptRes(undefined)

        toast("Code generated below")

        getProjects()
    }

    // if (!yaml) return <div />

    const inputClasses = 'border border-gray-300 rounded-md py-2 px-4 w-full '

    const serverOpts = [
        {
            value: "nodejs-express-server",
            label: "Nodejs Express Server"
        },
        { value: "ruby-on-rails", label: "Ruby on Rails" },
        { value: "spring", label: "Spring-Boot" }]

    let projectFolders: ProjectFolder[] = projects?.folders?.filter((project: any) => {
        return project?.directory
    })
    //sort by date
    projectFolders?.sort((a: ProjectFolder, b: ProjectFolder) => {
        return (new Date(b?.directory?.createdAt)).getTime() - (new Date(a?.directory?.createdAt)).getTime();
    })

    return (
        <div className='w-full mt-3 space-y-2 border-l-2 px-3' >
            <div className='font-semibold text-lg my-2'>Step 2</div>
            {/* <select
                className={inputClasses}
                onChange={e => {
                    setSelected(e.target.value)
                }}
            >
                {
                    serverOpts.map((opt) => {
                        return (
                            <option key={opt.value}
                                label={opt.label}
                                value={opt.value} />
                        )
                    })
                }
            </select> */}
            <div >
                <form
                    onSubmit={submit}
                    className='flex gap-3 items-center'
                >
                    <div className='w-full'>
                        <label className='text-sm font-semibold my-1'>

                        </label>
                        <textarea className={inputClasses}
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value)
                            }}
                            required
                        />
                    </div>
                    <div>
                        <button className='bg-gray-200 rounded-md shadow-md h-[40px] w-[40px] flex items-center justify-center'>
                            <BsSend />
                        </button>
                        {/* {isLoading && <Spinner />} */}
                    </div>
                </form>
            </div>
            <div className='mt-3 mb-7 text-sm px-2'>
                {gptRes}
            </div>
            {/* <div className='text-md font-semibold'>Generate Project</div>
            <button
                onClick={submit}
                className=' px-2 bg-gray-200 rounded-md shadow-md h-[40px] w-[fit-content]'>GENERATE CODE</button> */}
            {isLoading && <Spinner />}
            <div className='border-2 p-2 grid gap-2 grid-cols-2 border-gray-300 rounded-md min-h-[400px]'>
                {
                    projectFolders?.map((project: any) => {
                        return (
                            <div
                                className='border shadow-md rounded-md p-2 h-[fit-content] min-h-[100px]'
                                key={project?.folderName}>
                                {project?.directory ?
                                    <div className='space-y-2'>
                                        <div className='font-semibold text-sm text-center'>
                                            generator: {project?.directory?.language}
                                        </div>
                                        <div className='text-center font-semibold text-sm'>
                                            prompt: <br />
                                            <div className='text-xs'>{project?.directory?.prompt?.slice(0, 40)}
                                                {project?.directory?.prompt?.length > 40 ? '...' : ''}
                                            </div>
                                        </div>
                                        <div className='text-sm'>
                                            Created on: {moment(project?.directory?.createdAt).format('DD/MM/YYYY hh:mm A')}
                                        </div>

                                        <button
                                            onClick={() => download(project?.folderName)}
                                            className='px-2 text-sm roundezd-md shadow-md h-[30px] w-[fit-content] text-white font-semibold bg-blue-500'>
                                            Download
                                        </button>
                                    </div> :
                                    <div className='text-center'>File Not Available</div>
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Step2