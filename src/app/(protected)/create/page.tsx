'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormInput {
  projectName: string;
  githubToken: string;
  repoUrl: string;
}
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refresh = useRefetch()

  const onSubmit = (data: FormInput) => {
    if(!!checkCredits.data){
        createProject.mutate({
      name: data.projectName,
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
    }, {
      onSuccess: () => {
        toast.success("Project created successfully");
        refresh()
        reset();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
    } else {
      
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      
      })
    }
  };

  const hasEnoughCredicts = checkCredits.data?.userCredits ? checkCredits.data.fileCount! <= checkCredits.data.userCredits : true;

  return (
    <div className="flex items-center gap-12 h-full justify-center">
      <img src="/undraw_github.svg" className="h-56 w-auto" alt="github" />

      <div>
        <h1 className="font-semibold text-2xl">
          Link your GitHub Repository
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the URL of your repository to link it to Dino
        </p>
      </div>

      <div className="h-4"></div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
           {...register("projectName" , { required: true })}
            placeholder="Project Name"
            required
          />
          <div className="h-2"></div>
          <Input
           {...register("repoUrl" , { required: true })}
            placeholder="https://github.com/owner/repo"
            type="url"
            required
          />
          <div className="h-2"></div>
          <Input
           {...register("githubToken")}
            placeholder="GitHub Token (optional)"
            
          />
        {checkCredits.data && (
          <>
            <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
              <div className="flex items-center gap-2">
                <Info className='size-4' />
                <p className='text-sm'>You will be charged <strong>{checkCredits.data?.fileCount}</strong> credits for this</p>
              </div>
            </div>
            <p className='text-sm text-blue-800 ml-8'>You have <strong>{checkCredits.data?.userCredits}</strong> credits</p>
          </>
        )}
          <div className="h-4"></div>
          <Button type='submit' disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredicts}>
          {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
              </Button>
        </form>
      </div>
    </div>
  );
};


export default CreatePage;