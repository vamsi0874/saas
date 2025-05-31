
// 'use client'

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle
// } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
// import useProject from "@/hooks/use-project"
// import React from "react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle
// } from "@/components/ui/dialog"
// import Image from "next/image"
// import { askQuestion } from "./action"
// import { readStreamableValue } from "ai/rsc"
// import MDEditor from '@uiw/react-md-editor';

// const AskQuestionCard = () => {
//   const { project } = useProject()
//   const [question, setQuestion] = React.useState('')
//   const [open, setOpen] = React.useState(false)
//  const [loading, setLoading] = React.useState(false)
//  const [fileReferences, setFileReferences] = React.useState<Array<{ fileName: string; sourceCode: string; summary: string }>>([])
//  const [answer, setAnswer] = React.useState('')
 
//  const onSubmit = async(e: React.FormEvent) => {
//     setAnswer('')
//     setFileReferences([])
//     e.preventDefault()
//     if(!project?.id) return
//     setLoading(true)
   
//     const { output, fileReferenced } = await askQuestion(question, project.id)
//      setOpen(true)
//     setFileReferences(fileReferenced)

//     console.log("File References:", fileReferenced)

//     for await (const delta of readStreamableValue(output)) {
//       if(delta){
//         setAnswer(ans=> ans + delta)
//       }
//     }
//     setLoading(false)
//   }

//   return (
//     <>
//       <Card className="relative col-span-3">
//         <CardHeader>
//           <CardTitle>Ask a question</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={onSubmit}>
//             <Textarea
//               placeholder="Which file should I edit to change the home page?"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//             />
//             <div className="h-4" />
//             <Button type="submit">Ask VV!</Button>
//           </form>
//         </CardContent>
//       </Card>

//       {/* ✅ Clean dialog, centered and styled */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-[80vw]">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Image
//                 src="/logx.png"
//                 alt="logo"
//                 width={40}
//                 height={40}
//                 className="rounded-full"
//               />
              
//                 <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll-y" />

//                 <Button type="button" disabled={loading} onClick={() => setOpen(false)} className="ml-auto">
//                   Close
//                   {/* You can add a spinner here if needed */}
//                 </Button>
                
                
              
//             </DialogTitle>
//           </DialogHeader>
//           <div className="mt-2 text-sm text-gray-700">
//             {/* You can replace this with actual response content */}
//             Your answer will appear here.
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default AskQuestionCard

'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import useProject from "@/hooks/use-project"
import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import Image from "next/image"
import { askQuestion } from "./action"
import { readStreamableValue } from "ai/rsc"
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from "./code-references"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"
const AskQuestionCard = () => {
  const { project } = useProject()
  const [question, setQuestion] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [fileReferences, setFileReferences] = React.useState<Array<{ fileName: string; sourceCode: string; summary: string }>>([])
  const [answer, setAnswer] = React.useState('')
  
  const saveAnswer = api.project.saveAnswer.useMutation()

  const onSubmit = async (e: React.FormEvent) => {
    setAnswer('')
    setFileReferences([])
    e.preventDefault()
    if (!project?.id) return

    setAnswer('')
    setFileReferences([])
    setLoading(true)
  

    const { output, fileReferenced } = await askQuestion(question, project.id)
      setOpen(true)
    setFileReferences(fileReferenced)

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer(ans => ans + delta)
      }
    }

    setLoading(false)
  }

  const refetch = useRefetch()

  return (
    <>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading}>
              {loading ? 'Thinking...' : 'Ask VV!'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-3">
              <Image
                src="/logx.png"
                alt="logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              {/* <span className="text-lg font-semibold">
                {loading ? 'Thinking...' : "VV's Answer"}
              </span> */}
            </DialogTitle>
            <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={
              ()=>{
                saveAnswer.mutate({
                  projectId: project?.id || '',
                  question,
                   answer,
                  filesReferences: fileReferences
                } , {
                  onSuccess: ()=>{
                    toast.success('Answer saved successfully!')
                    refetch()
                  } , 
                  onError: (error)=>{
                    toast.error(error.message)
                  }
                })
              }
            }>
              Save Answer
            </Button>
            </div>
          </DialogHeader>

          <div className="prose max-w-none w-full mb-4 overflow-y-auto max-h-[40vh] border border-gray-200 rounded-md p-4 bg-black">
            <MDEditor.Markdown source={answer || 'Your answer will appear here.'} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll-y" />
          </div>

          <CodeReferences filesReferences={fileReferences} />

          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => setOpen(false)} disabled={loading}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AskQuestionCard
