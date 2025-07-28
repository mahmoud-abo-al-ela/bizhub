export const structure = (S) =>
  S.list()
    .title("Content")
    .items([
      // Company Submissions
      S.listItem()
        .title("Company Submissions")
        .child(
          S.list()
            .title("Company Submissions")
            .items([
              // All Submissions
              S.listItem()
                .title("All Submissions")
                .child(
                  S.documentList()
                    .title("All Submissions")
                    .filter('_type == "companySubmission"')
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // Pending Submissions
              S.listItem()
                .title("Pending Review")
                .child(
                  S.documentList()
                    .title("Pending Review")
                    .filter(
                      '_type == "companySubmission" && status == "pending"'
                    )
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // Approved Submissions
              S.listItem()
                .title("Approved")
                .child(
                  S.documentList()
                    .title("Approved")
                    .filter(
                      '_type == "companySubmission" && status == "approved"'
                    )
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // Rejected Submissions
              S.listItem()
                .title("Rejected")
                .child(
                  S.documentList()
                    .title("Rejected")
                    .filter(
                      '_type == "companySubmission" && status == "rejected"'
                    )
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),
            ])
        ),

      // Regular document types
      ...S.documentTypeListItems().filter(
        (listItem) => !["companySubmission"].includes(listItem.getId())
      ),
    ]);
