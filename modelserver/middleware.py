from typing import Union

from starlette.staticfiles import (  # type: ignore[attr-defined]
    PathLike,
    Scope,
    StaticFiles,
)


class StaticReactRouterFiles(StaticFiles):
    """
    Customzied version of upstream StaticFiles app that resolves all react browser routes to the index.html file.
    """

    def __init__(
        self,
        *,
        directory: PathLike | None = None,
        packages: list[Union[str, tuple[str, str]]] | None = None,
        html: bool = False,
        check_dir: bool = True,
        follow_symlink: bool = False,
    ) -> None:
        super().__init__(
            directory=directory,
            packages=packages,
            html=html,
            check_dir=check_dir,
            follow_symlink=follow_symlink,
        )

    def get_path(self, scope: Scope) -> str:
        path: str = scope["path"]
        if path.startswith("/assets") or path == "/":
            return super().get_path(scope)
        else:
            scope["path"] = "/"
            return super().get_path(scope)
