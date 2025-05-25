'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";

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

  const refresh = useRefetch()

  const onSubmit = (data: FormInput) => {
    console.log(data);
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
  };

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
          <div className="h-4"></div>
          <Button
          disabled={createProject.isPending}
            type="submit"
            
            >Create Project</Button>
        </form>
      </div>
    </div>
  );
};


export default CreatePage;