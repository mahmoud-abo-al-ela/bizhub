export const structure = (S) =>
  S.list()
    .title("Content")
    .items([
      // Companies Section
      S.listItem()
        .title("Companies")
        .icon(() => "🏢")
        .child(
          S.list()
            .title("Companies")
            .items([
              // Active Companies
              S.listItem()
                .title("All Companies")
                .icon(() => "📋")
                .child(
                  S.documentList()
                    .title("All Companies")
                    .filter('_type == "company"')
                    .defaultOrdering([
                      { field: "companyName", direction: "asc" },
                    ])
                ),

              // Featured Companies
              S.listItem()
                .title("Featured Companies")
                .icon(() => "⭐")
                .child(
                  S.documentList()
                    .title("Featured Companies")
                    .filter('_type == "company" && featured == true')
                    .defaultOrdering([
                      { field: "companyName", direction: "asc" },
                    ])
                ),

              // By Plan Type
              S.listItem()
                .title("By Plan Type")
                .icon(() => "📊")
                .child(
                  S.list()
                    .title("By Plan Type")
                    .items([
                      S.listItem()
                        .title("Free Plan")
                        .icon(() => "🆓")
                        .child(
                          S.documentList()
                            .title("Free Plan Companies")
                            .filter('_type == "company" && planType == "free"')
                            .defaultOrdering([
                              { field: "companyName", direction: "asc" },
                            ])
                        ),
                      S.listItem()
                        .title("Professional Plan")
                        .icon(() => "🔹")
                        .child(
                          S.documentList()
                            .title("Professional Plan Companies")
                            .filter(
                              '_type == "company" && planType == "professional"'
                            )
                            .defaultOrdering([
                              { field: "companyName", direction: "asc" },
                            ])
                        ),
                      S.listItem()
                        .title("Enterprise Plan")
                        .icon(() => "🔸")
                        .child(
                          S.documentList()
                            .title("Enterprise Plan Companies")
                            .filter(
                              '_type == "company" && planType == "enterprise"'
                            )
                            .defaultOrdering([
                              { field: "companyName", direction: "asc" },
                            ])
                        ),
                    ])
                ),
            ])
        ),

      // Company Submissions
      S.listItem()
        .title("Applications")
        .icon(() => "📝")
        .child(
          S.list()
            .title("Applications")
            .items([
              // All Submissions
              S.listItem()
                .title("All Applications")
                .icon(() => "📋")
                .child(
                  S.documentList()
                    .title("All Applications")
                    .filter('_type == "applications"')
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // Pending Submissions
              S.listItem()
                .title("Pending Review")
                .icon(() => "⏳")
                .child(
                  S.documentList()
                    .title("Pending Review")
                    .filter('_type == "applications" && status == "pending"')
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // Approved Submissions
              S.listItem()
                .title("Approved")
                .icon(() => "✅")
                .child(
                  S.documentList()
                    .title("Approved")
                    .filter('_type == "applications" && status == "approved"')
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // Rejected Submissions
              S.listItem()
                .title("Rejected")
                .icon(() => "❌")
                .child(
                  S.documentList()
                    .title("Rejected")
                    .filter('_type == "applications" && status == "rejected"')
                    .defaultOrdering([
                      { field: "submissionDate", direction: "desc" },
                    ])
                ),

              // By Plan Type
              S.listItem()
                .title("By Plan Type")
                .icon(() => "📊")
                .child(
                  S.list()
                    .title("By Plan Type")
                    .items([
                      S.listItem()
                        .title("Free Plan")
                        .icon(() => "🆓")
                        .child(
                          S.documentList()
                            .title("Free Plan Submissions")
                            .filter(
                              '_type == "applications" && planType == "free"'
                            )
                            .defaultOrdering([
                              { field: "submissionDate", direction: "desc" },
                            ])
                        ),
                      S.listItem()
                        .title("Professional Plan")
                        .icon(() => "🔹")
                        .child(
                          S.documentList()
                            .title("Professional Plan Submissions")
                            .filter(
                              '_type == "applications" && planType == "professional"'
                            )
                            .defaultOrdering([
                              { field: "submissionDate", direction: "desc" },
                            ])
                        ),
                      S.listItem()
                        .title("Enterprise Plan")
                        .icon(() => "🔸")
                        .child(
                          S.documentList()
                            .title("Enterprise Plan Submissions")
                            .filter(
                              '_type == "applications" && planType == "enterprise"'
                            )
                            .defaultOrdering([
                              { field: "submissionDate", direction: "desc" },
                            ])
                        ),
                    ])
                ),
            ])
        ),
    ]);
