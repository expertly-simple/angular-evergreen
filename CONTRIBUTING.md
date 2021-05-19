# Contributing to Angular Evergreen

We would love for you to contribute to Angular Evergreen and help make it even better than it is today!
As a contributor, here are the guidelines we would like you to follow:

- [Bugs and Feature Requests](#issue)
- [Submission Guidelines](#submit)
- [Coding Rules](#rules)
- [Commit Message Guidelines](#commit)

## <a name="issue"></a> Found a Bug or Missing a Feature?

If you find a bug in the source code or want to _request_ a new feature, you can help us by [submitting an issue](#submit-issue) to our [GitHub Repository](https://github.com/expertly-simple/angular-evergreen).
Even better, you can [submit a Pull Request](#submit-pr) with the fix or the new feature.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker, maybe an issue for your problem already exists and the discussion might inform you of workarounds readily available.

You can file new issues [here](https://github.com/expertly-simple/angular-evergreen/issues/new).

### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/expertly-simple/angular-evergreen/pulls) for an open or closed PR that relates to your submission.
   You don't want to duplicate existing efforts.

2. [Fork](https://github.com/expertly-simple/angular-evergreen/fork) the angular-evergreen repo.

3. In your forked repository, make your changes in a new git branch:

   ```shell
   git checkout -b my-fix-branch master
   ```

4. Create your patch.

5. Follow our [Coding Rules](#rules).

6. Commit your changes _preferably_ using a descriptive commit message that follows our [commit message conventions](#commit).
   Adherence to these conventions is not necessary but you will save us time because release notes are automatically generated from these messages.

   ```shell
   git commit --all
   ```

   Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

7. Push your branch to GitHub:

   ```shell
   git push origin my-fix-branch
   ```

8. In GitHub, send a pull request to `angular-evergreen:master`.

## <a name="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind when you are ready to submit a PR:

- Run `npm run style:fix` for code style enforcement.
- Run `npm run lint:fix` for linting.

## <a name="commit"></a> Commit Message Format

Our commit messages follow the [conventional commits specification](https://www.conventionalcommits.org/).
