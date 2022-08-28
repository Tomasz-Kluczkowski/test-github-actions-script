module.exports = async (github, context) => {
    // console.log(process.env);
    // console.log('Test text');
    console.log(github);
    // console.log(context);
    // Get pull requests that are open for current ref.
    const pullRequests = await github.rest.pulls.list({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: 'open',
        head: `${context.repo.owner}:${context.ref.replace('refs/heads/', '')}`
    })

    // Set issue number for following calls from context (if on pull request event) or from above variable.
    const issueNumber = context.issue.number || pullRequests.data[0].number

    // Retrieve existing bot comments for the PR
    const {data: comments} = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
    })
    const botComment = comments.find(comment => {
        return comment.user.type === 'Bot' && comment.body.includes('Terraform Plan')
    })

    // Prepare format of the comment
    const output = `#### Terraform Plan 📖\`${process.env.TERRAFORM_PLAN_STEP_OUTCOME}\`
          <hr>

          *Pusher: @${github.actor}*
          *Action: \`${github.event_name}\`*
          *Workflow: \`${github.workflow}\`*
          *Commit: \`${github.sha}\`*

          <details><summary>Show Plan</summary>

          \`\`\`\n
          ${process.env.TERRAFORM_PLAN}
          \`\`\`

          </details>`;

    // If we have a comment, update it, otherwise create a new one
    if (botComment) {
        github.rest.issues.updateComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: botComment.id,
            body: output
        })
    } else {
        github.rest.issues.createComment({
            issue_number: issueNumber,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: output
        })
    }
}


// // Get pull requests that are open for current ref.
// const pullRequests = await github.rest.pulls.list({
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     state: 'open',
//     head: `${context.repo.owner}:${context.ref.replace('refs/heads/', '')}`
// })
//
// // Set issue number for following calls from context (if on pull request event) or from above variable.
// const issueNumber = context.issue.number || pullRequests.data[0].number
//
// // Retrieve existing bot comments for the PR
// const {data: comments} = await github.rest.issues.listComments({
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     issue_number: issueNumber,
// })
// const botComment = comments.find(comment => {
//     return comment.user.type === 'Bot' && comment.body.includes('Terraform Plan')
// })
//
// // Prepare format of the comment
// const output = `#### Terraform Plan 📖\`${{steps.terraform-plan.outcome}}\`
//           <hr>
//
//           *Pusher: @${{github.actor}}*
//           *Action: \`${{github.event_name}}\`*
//           *Workflow: \`${{github.workflow}}\`*
//           *Commit: \`${{github.sha}}\`*
//
//           <details><summary>Show Plan</summary>
//
//           \`\`\`\n
//           ${{env.TERRAFORM_PLAN}}
//           \`\`\`
//
//           </details>`;
//
// // If we have a comment, update it, otherwise create a new one
// if (botComment) {
//     github.rest.issues.updateComment({
//         owner: context.repo.owner,
//         repo: context.repo.repo,
//         comment_id: botComment.id,
//         body: output
//     })
// } else {
//     github.rest.issues.createComment({
//         issue_number: issueNumber,
//         owner: context.repo.owner,
//         repo: context.repo.repo,
//         body: output
//     })
// }
//
