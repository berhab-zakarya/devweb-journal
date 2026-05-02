<!DOCTYPE html>
<html>
<body>
<p>Hello,</p>
<p>You have been assigned to review the article <strong>{{ $articleTitle }}</strong>.</p>
@if($dueDate)
<p>Due date: <strong>{{ $dueDate }}</strong></p>
@else
<p>There is no deadline for this review.</p>
@endif
<p>Please log in to the journal platform to accept or decline this assignment.</p>
</body>
</html>
