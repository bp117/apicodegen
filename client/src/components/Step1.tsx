import * as React from 'react'

import AceEditor from "react-ace";

import 'ace-builds/src-noconflict/ace';
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/webpack-resolver";

import { generateYaml } from '../WebService';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import Spinner from './Spinner';

import fileDownload from 'js-file-download'

import { TfiDownload } from 'react-icons/tfi'
import { BsSend } from 'react-icons/bs'

const Step1 = () => {

    const {
        yaml, setYaml,
        //
        prompt,
        setPrompt
    }: any = React.useContext(AppContext)

    const [isLoading, setIsLoading] = React.useState<boolean>(false)



    const submit = async (e: any) => {
        e?.preventDefault()
        setIsLoading(true)
        const data = {
            prompt
        }
        const res: any = await generateYaml(data)

        if (res?.error) {
            toast('Error occured')
            setIsLoading(false)
            return
        }

        const find = '---YAML---\n'
        const after_yaml_ = res?.data.slice(res?.data.indexOf(find) + find.length);

        const countedWords = countWords(res?.data)

        if (countedWords > 2048) {
            toast('Words exceeded 2048\n Please regenerate a shorter API spec')
        }

        setYaml(after_yaml_)
        setIsLoading(false)
    }

    const downloadYaml = () => {
        fileDownload(yaml, `generated_${Date.now()}.yaml`);
    }

    const countWords = (str: string) => {
        // Split the string into an array of words using a regular expression
        const words = str.match(/\b\w+\b/g);

        // If no words are found, return 0
        if (!words) {
            return 0;
        }

        // Otherwise, return the length of the words array
        return words.length;
    }


    const inputClasses = 'border border-gray-300 rounded-md py-2 px-4 w-full'

    return (
        <div className='w-full max-w-[550px] space-y-3 mx-3 my-3'>
            <div className='font-semibold text-lg my-2'>Step 1</div>
            <div className='text-md font-semibold'>Create an API spec</div>
            <div >
                <form
                    onSubmit={submit}
                    className='flex gap-3 items-center'
                >
                    <div className='w-full'>
                        <label className='text-sm font-semibold my-1'>Enter API description</label>
                        <textarea className={inputClasses}
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value)
                            }}
                            required
                        />
                    </div>
                    <div>
                        <button className='bg-gray-200 rounded-md shadow-md h-[40px] w-[40px] flex justify-center items-center'>
                            <BsSend />
                        </button>
                        {isLoading && <Spinner />}
                    </div>
                </form>
            </div>
            <div>
                <div className='font-semibold text-sm'>Generated YAML (Max 2048 words)</div>
                <div className='border-2 border-gray-300 rounded-md min-h-[400px] relative'>
                    {yaml?.trim() !== "" && yaml ?
                        <div
                            onClick={downloadYaml}
                            className='w-[fit-content] right-2 top-2 absolute z-10 cursor-pointer'>
                            <TfiDownload
                                size={18}
                            />
                        </div> : undefined
                    }
                    <AceEditor
                        mode="yaml"
                        theme="github"
                        onChange={(value: string) => { setYaml(value) }}
                        name="yaml_editor_1"
                        editorProps={{ $blockScrolling: true }}
                        maxLines={Infinity}
                        // className='!w-full  !h-[300px]'
                        // height='100%'
                        width='100%'
                        value={yaml}
                    />
                </div>
            </div>
        </div>
    )
}

export default Step1