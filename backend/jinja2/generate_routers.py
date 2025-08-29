from jinja2 import Environment, FileSystemLoader
import os
import re

# 指定模板目錄
current_dir = os.path.dirname(os.path.abspath(__file__))
env = Environment(loader=FileSystemLoader(current_dir))
template = env.get_template("router_template.j2")


def pascal_to_snake(name: str):
    """
    將駝峰命名 (CamelCase) 轉成蛇形命名 (snake_case)
    例如 SubCategory -> sub_category
    """
    if not name:
        return ""
    # 在大寫字母前加 '_'，然後轉小寫
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    s2 = re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1)
    return s2.lower()


def pascal_to_camel(name: str) -> str:
    if not name:
        return ""
    return name[0].lower() + name[1:]


def generate_router(model_name: str, output_dir: str):
    model_name_snake = pascal_to_snake(model_name)
    model_name_camel = pascal_to_camel(model_name)
    content = template.render(
        model_name=model_name,
        model_name_snake=model_name_snake,
        model_name_camel=model_name_camel,
    )

    output_file = os.path.join(output_dir, f"{model_name_snake}.py")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"生成檔案: {output_file}")


def generate_multiple_routers(model_names: list[str], output_dir: str):
    for model_name in model_names:
        generate_router(model_name, output_dir)


# 範例：一次生成多個模型路由
models = [
    "Category",
    "Product",
    "Color",
    "Gender",
    "Series",
    "Size",
    "SubCategory",
    "SubProduct",
    "Nav"
]


root_path = os.getcwd()
target_dir_path = os.path.join(root_path, "src", "router", "v1", "admin")
generate_multiple_routers(models, output_dir=target_dir_path)
