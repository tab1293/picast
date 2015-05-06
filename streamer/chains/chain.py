class Chain:

    _modules = []

    def __init__(self, modules=[]):
        for module in modules:
            self.addModule(module)

    def __str__(self):
        output = "#"
        for i, module in enumerate(self._modules):
            output += str(module)

            if i != len(self._modules) - 1:
                output += ":"

        return output

    def addModule(self, module):
        self._modules.append(module)

    def removeModule(self, module_name):
        rmv_index = -1
        for i, module in enumerate(module):
            if module_name == module.getName():
                rmv_index = i
                break
        try:
            self._modules.remove(rmv_index)
        except ValueError:
            raise ValueError("Module {0} is not in this chain so can't remove it".format(module_name))



