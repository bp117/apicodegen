import * as React from "react";

export const AppContext = React.createContext({});

const AppContextFC = (props: any) => {
    const [yaml, setYaml] = React.useState<string>('');
    const [prompt, setPrompt] = React.useState<string>('');
    const [projects, setProjects] = React.useState<undefined | any[]>(undefined);

    return (
        <AppContext.Provider
            value={{
                yaml,
                setYaml,
                //
                prompt,
                setPrompt,
                //
                projects,
                setProjects
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextFC;
