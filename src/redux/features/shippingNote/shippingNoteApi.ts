import { baseApi } from "../../api/baseApi";
import { IShippingNote } from "../../../types/shippingNote";

const shippingNoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createShippingNote: builder.mutation<IShippingNote, Partial<IShippingNote>>(
      {
        query: (data) => ({
          url: "/shipping-note-templates",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["shippingNotes"],
      },
    ),
    getAllShippingNotes: builder.query<
      { success: boolean; data: IShippingNote[] },
      void
    >({
      query: () => ({
        url: "/shipping-note-templates",
        method: "GET",
      }),
      providesTags: ["shippingNotes"],
    }),
    updateShippingNote: builder.mutation<
      IShippingNote,
      { id: string; data: Partial<IShippingNote> }
    >({
      query: ({ id, data }) => ({
        url: `/shipping-note-templates/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["shippingNotes"],
    }),
    deleteShippingNote: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/shipping-note-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["shippingNotes"],
    }),
  }),
});

export const {
  useCreateShippingNoteMutation,
  useGetAllShippingNotesQuery,
  useUpdateShippingNoteMutation,
  useDeleteShippingNoteMutation,
} = shippingNoteApi;
