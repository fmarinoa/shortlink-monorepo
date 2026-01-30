import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { LinksResponse } from "@shortlink/core";

export const useLinks = () => {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const { data } = await api.get<LinksResponse>("/links");
      return data;
    },
  });
};

export const useLinkMutations = () => {
  const queryClient = useQueryClient();

  const createLink = useMutation({
    mutationFn: ({ newLink }: { newLink: { slug: string; url: string } }) =>
      api.post("/links", newLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const deleteLink = useMutation({
    mutationFn: (slug: string) => api.delete(`/links/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  const updateLink = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: { url: string } }) =>
      api.put(`/links/${slug}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });

  return { createLink, deleteLink, updateLink };
};
